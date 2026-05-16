import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ClaimApiService } from '../../../../core/services/claim-api.service';
import { DamageApiService } from '../../../../core/services/damage-api.service';
import {
  CLAIM_STATUS,
  CLAIM_STATUS_VALUES,
  Claim,
  ClaimStatus,
  UpdateClaimRequest
} from '../../../../types/claim.types';
import { ApiErrorResponse } from '../../../../types/api.types';
import {
  CreateDamageRequest,
  Damage,
  DamageSeverity,
  UpdateDamageRequest
} from '../../../../types/damage.types';

const imageUrlPattern = /^https?:\/\/.+/i;

type ClaimFormValue = {
  title: string;
  description: string;
  status: ClaimStatus;
};

type DamageFormValue = {
  part: string;
  severity: DamageSeverity;
  imageUrl: string;
  price: number;
};

@Component({
  selector: 'app-claim-detail',
  standalone: false,
  templateUrl: './claim-detail.component.html',
  styleUrl: './claim-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly claimApiService = inject(ClaimApiService);
  private readonly damageApiService = inject(DamageApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  public readonly claim = signal<Claim | null>(null);
  public readonly damages = signal<Damage[]>([]);
  public readonly loading = signal(true);
  public readonly claimSaving = signal(false);
  public readonly damageSaving = signal(false);
  public readonly loadErrorMessage = signal<string | null>(null);
  public readonly claimErrorMessage = signal<string | null>(null);
  public readonly damageErrorMessage = signal<string | null>(null);
  public readonly editingDamageId = signal<string | null>(null);
  public readonly claimStatus = CLAIM_STATUS;
  public readonly claimStatusOptions = CLAIM_STATUS_VALUES;

  public readonly totalAmount = computed(() =>
    this.damages().reduce((sum, damage) => sum + damage.price, 0)
  );

  public readonly canManageDamages = computed(() => this.claim()?.status === CLAIM_STATUS.PENDING);

  public readonly claimForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]],
    status: [CLAIM_STATUS.PENDING as ClaimStatus, [Validators.required]]
  });

  public readonly damageForm = this.formBuilder.nonNullable.group({
    part: ['', [Validators.required, Validators.maxLength(120)]],
    severity: ['low' as DamageSeverity, [Validators.required]],
    imageUrl: ['', [Validators.required, Validators.pattern(imageUrlPattern)]],
    price: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const claimId = params.get('id') ?? '';
          this.loading.set(true);
          this.loadErrorMessage.set(null);
          this.claimErrorMessage.set(null);
          this.damageErrorMessage.set(null);
          this.resetForm();

          return forkJoin({
            claim: this.claimApiService.getClaimById(claimId),
            damages: this.damageApiService.listDamagesByClaimId(claimId)
          });
        })
      )
      .subscribe({
        next: ({ claim, damages }) => {
          this.claim.set(claim);
          this.patchClaimForm(claim);
          this.setDamages(damages);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.claim.set(null);
          this.damages.set([]);
          this.loadErrorMessage.set(
            'The claim detail could not be loaded. Check that the backend is running.'
          );
        }
      });
  }

  public get isEditMode(): boolean {
    return this.editingDamageId() !== null;
  }

  public trackByDamageId(_: number, damage: Damage): string {
    return damage._id;
  }

  public submitClaim(): void {
    const claim = this.claim();

    if (!claim) {
      return;
    }

    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    this.claimSaving.set(true);
    this.claimErrorMessage.set(null);

    this.claimApiService
      .updateClaim(claim._id, this.toClaimPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedClaim) => {
          this.claim.set(updatedClaim);
          this.patchClaimForm(updatedClaim);
          this.claimSaving.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.claimSaving.set(false);
          this.claimErrorMessage.set(this.getApiErrorMessage(error, 'The claim could not be updated.'));
        }
      });
  }

  public startEdit(damage: Damage): void {
    if (!this.canManageDamages()) {
      return;
    }

    this.editingDamageId.set(damage._id);
    this.damageForm.setValue({
      part: damage.part,
      severity: damage.severity,
      imageUrl: damage.imageUrl,
      price: damage.price
    });
  }

  public cancelEdit(): void {
    this.resetForm();
  }

  public submitDamage(): void {
    if (!this.canManageDamages()) {
      return;
    }

    if (this.damageForm.invalid || !this.claim()) {
      this.damageForm.markAllAsTouched();
      return;
    }

    this.damageSaving.set(true);
    this.damageErrorMessage.set(null);

    const claim = this.claim();
    if (!claim) {
      this.damageSaving.set(false);
      return;
    }

    const payload = this.toDamagePayload();
    const editingDamageId = this.editingDamageId();

    if (editingDamageId) {
      this.damageApiService
        .updateDamage(claim._id, editingDamageId, payload as UpdateDamageRequest)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updatedDamage) => {
            this.setDamages(
              this.damages().map((damage) =>
                damage._id === updatedDamage._id ? updatedDamage : damage
              )
            );
            this.damageSaving.set(false);
            this.resetForm();
          },
          error: (error: HttpErrorResponse) => {
            this.damageSaving.set(false);
            this.damageErrorMessage.set(
              this.getApiErrorMessage(error, 'The damage could not be updated.')
            );
          }
        });

      return;
    }

    this.damageApiService
      .createDamage(claim._id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdDamage) => {
          this.setDamages([createdDamage, ...this.damages()]);
          this.damageSaving.set(false);
          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          this.damageSaving.set(false);
          this.damageErrorMessage.set(
            this.getApiErrorMessage(error, 'The damage could not be created.')
          );
        }
      });
  }

  public deleteDamage(damageId: string): void {
    const claim = this.claim();

    if (!claim || !this.canManageDamages()) {
      return;
    }

    this.damageSaving.set(true);
    this.damageErrorMessage.set(null);

    this.damageApiService
      .deleteDamage(claim._id, damageId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.setDamages(this.damages().filter((damage) => damage._id !== damageId));
          this.damageSaving.set(false);

          if (this.editingDamageId() === damageId) {
            this.resetForm();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.damageSaving.set(false);
          this.damageErrorMessage.set(
            this.getApiErrorMessage(error, 'The damage could not be deleted.')
          );
        }
      });
  }

  public severityBadgeClass(severity: DamageSeverity): string {
    if (severity === 'high') {
      return 'text-bg-danger';
    }

    if (severity === 'mid') {
      return 'text-bg-warning';
    }

    return 'text-bg-info';
  }

  public statusBadgeClass(status: Claim['status']): string {
    if (status === CLAIM_STATUS.FINISHED) {
      return 'text-bg-success';
    }

    if (status === CLAIM_STATUS.IN_REVIEW) {
      return 'text-bg-warning';
    }

    return 'text-bg-secondary';
  }

  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private setDamages(damages: Damage[]): void {
    this.damages.set(damages);

    const claim = this.claim();
    if (!claim) {
      return;
    }

    this.claim.set({
      ...claim,
      totalAmount: damages.reduce((sum, damage) => sum + damage.price, 0)
    });
  }

  private patchClaimForm(claim: Claim): void {
    this.claimForm.reset({
      title: claim.title,
      description: claim.description,
      status: claim.status
    });
  }

  private resetForm(): void {
    this.editingDamageId.set(null);
    this.damageForm.reset({
      part: '',
      severity: 'low',
      imageUrl: '',
      price: 0
    });
  }

  private toClaimPayload(): UpdateClaimRequest {
    const rawValue: ClaimFormValue = this.claimForm.getRawValue();

    return {
      title: rawValue.title.trim(),
      description: rawValue.description.trim(),
      status: rawValue.status
    };
  }

  private toDamagePayload(): CreateDamageRequest {
    const rawValue: DamageFormValue = this.damageForm.getRawValue();

    return {
      part: rawValue.part.trim(),
      severity: rawValue.severity,
      imageUrl: rawValue.imageUrl.trim(),
      price: Number(rawValue.price)
    };
  }

  private getApiErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    const payload = error.error as ApiErrorResponse | null;
    return payload?.message ?? fallbackMessage;
  }
}
