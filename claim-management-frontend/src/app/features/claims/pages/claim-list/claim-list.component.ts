import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ClaimApiService } from '../../../../core/services/claim-api.service';
import { CLAIM_STATUS, Claim } from '../../../../types/claim.types';

@Component({
  selector: 'app-claim-list',
  standalone: false,
  templateUrl: './claim-list.component.html',
  styleUrl: './claim-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimListComponent implements OnInit {
  private readonly claimApiService = inject(ClaimApiService);

  public readonly claims = signal<Claim[]>([]);
  public readonly loading = signal(true);
  public readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadClaims();
  }

  public trackByClaimId(_: number, claim: Claim): string {
    return claim._id;
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

  private loadClaims(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.claimApiService
      .listClaims()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (claims) => this.claims.set(claims),
        error: () => {
          this.errorMessage.set(
            'The claim list could not be loaded. Check that the backend is running.'
          );
          this.claims.set([]);
        }
      });
  }
}
