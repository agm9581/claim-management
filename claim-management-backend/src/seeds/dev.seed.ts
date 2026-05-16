import { CLAIM_STATUS, type ClaimStatus, ClaimModel } from "../entities/models/claim/claim.model";
import {
  DAMAGE_SEVERITY,
  type DamageSeverity,
  DamageModel,
} from "../entities/models/damage/damage.model";

type SeedClaim = {
  title: string;
  description: string;
  status: ClaimStatus;
  damages: Array<{
    part: string;
    severity: DamageSeverity;
    imageUrl: string;
    price: number;
  }>;
};

const seedClaims: SeedClaim[] = [
  {
    title: "Rear bumper collision",
    description: "Low speed parking impact with visible rear bumper and trunk damage.",
    status: CLAIM_STATUS.IN_REVIEW,
    damages: [
      {
        part: "Rear bumper",
        severity: DAMAGE_SEVERITY.MID,
        imageUrl: "https://images.example.com/claims/rear-bumper.jpg",
        price: 850,
      },
      {
        part: "Trunk lid",
        severity: DAMAGE_SEVERITY.LOW,
        imageUrl: "https://images.example.com/claims/trunk-lid.jpg",
        price: 420,
      },
    ],
  },
  {
    title: "Front-left side impact",
    description: "Collision on the front-left corner affecting wheel arch and headlight.",
    status: CLAIM_STATUS.PENDING,
    damages: [
      {
        part: "Front-left fender",
        severity: DAMAGE_SEVERITY.HIGH,
        imageUrl: "https://images.example.com/claims/front-left-fender.jpg",
        price: 1400,
      },
      {
        part: "Left headlight",
        severity: DAMAGE_SEVERITY.MID,
        imageUrl: "https://images.example.com/claims/left-headlight.jpg",
        price: 680,
      },
      {
        part: "Wheel arch trim",
        severity: DAMAGE_SEVERITY.LOW,
        imageUrl: "https://images.example.com/claims/wheel-arch-trim.jpg",
        price: 210,
      },
    ],
  },
];

export async function seedDevelopmentData() {
  await DamageModel.deleteMany({});
  await ClaimModel.deleteMany({});

  for (const entry of seedClaims) {
    const totalAmount = entry.damages.reduce((sum, damage) => sum + damage.price, 0);

    const claim = await ClaimModel.create({
      title: entry.title,
      description: entry.description,
      status: entry.status,
      totalAmount,
    });

    await DamageModel.insertMany(
      entry.damages.map((damage) => ({
        ...damage,
        claimId: claim.id,
      })),
    );
  }

  console.log(`Seeded ${seedClaims.length} claims with sample damages`);
}
