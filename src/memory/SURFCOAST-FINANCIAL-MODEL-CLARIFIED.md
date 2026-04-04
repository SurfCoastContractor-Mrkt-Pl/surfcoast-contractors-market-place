# SurfCoast Financial Model - Clarified

## Communication & Engagement Types

### 1. Job Posting
- **Cost:** FREE
- **Client:** Posts a straightforward service request
- **Contractor:** Can view and apply directly
- **Process:** Simple, quick engagement model
- **Status:** Free for clients to post

### 2. Request for Proposal (RFP)
- **Cost:** $1.75 per RFP sent
- **Client:** Pays $1.75 to send RFP to specific contractor(s)
- **Contractor:** Receives RFP, fills it out, sends proposal back FOR FREE
- **Process:** Formal, structured proposal submission
- **No messaging between RFP send and proposal receipt**
- **Status:** Paid by client ($1.75 fee)

### 3. Communication Sessions
Two models available for direct communication between clients and contractors:

#### Model A: Timed Chat Session
- **Cost:** $1.50 per 10-minute session
- **Duration:** 10 minutes of real-time chat
- **Available to:** Both clients and contractors
- **Stripe Product:** Limited Comm. (prod_U8T2aMfXJ8Ztfm)
- **Price ID:** STRIPE_LIMITED_COMM_PRICE_ID

#### Model B: Unlimited Communication Subscription
- **Cost:** $50/month
- **Duration:** Unlimited communication for entire month
- **Available to:** Both clients and contractors
- **Benefits:** Unlimited messaging without per-session fees
- **Stripe Product ID:** STRIPE_SUBSCRIPTION_COMM_PRICE_ID

## Payment Gates

| Feature | Cost | Paid By | Stripe Reference |
|---------|------|---------|------------------|
| Job Posting | Free | N/A | N/A |
| RFP Sending | $1.75 | Client | STRIPE_QUOTE_PRICE_ID |
| Timed Chat (10 min) | $1.50 | Both | STRIPE_LIMITED_COMM_PRICE_ID |
| Unlimited Chat (Monthly) | $50.00 | Both | STRIPE_SUBSCRIPTION_COMM_PRICE_ID |

## Implementation Status
- ✅ Clarified financial model
- ⏳ Pending: Entity schema alignment
- ⏳ Pending: Payment gate implementation
- ⏳ Pending: UI/UX updates