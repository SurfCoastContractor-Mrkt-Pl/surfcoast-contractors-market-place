# MarketShop Payment & Billing System

## Overview
Complete payment management system for MarketShop vendors with support for both subscription and facilitation fee models, payment method management, and billing status tracking.

## Features Implemented

### 1. Payment Model Selection
- **Component**: `PaymentModelSelector.jsx`
- Users choose between:
  - **$35/month subscription** - Flat predictable costs
  - **5% facilitation fee** - Pay only on transactions
- Clean, visual card-based interface
- Clear feature comparison

### 2. Subscription Management
- **Component**: `SubscriptionManager.jsx`
- View current subscription status (active, cancelled, past_due)
- Display billing dates and amounts
- **Renew subscriptions** - Option to reactivate cancelled subscriptions
- **Switch payment models** - Change from subscription to facilitation fee (after billing cycle)
- **Constraints**:
  - Can only switch if subscription is active and in good standing
  - Past due subscriptions must be paid before any changes
  - Model switches take effect at next billing cycle

### 3. Payment Method Management
- **Component**: `PaymentMethodManager.jsx`
- Update credit card information
- Integration with Stripe for secure card processing
- Persistent confirmation dialogs with close button (×)
- Success/error feedback

### 4. Confirmation Dialogs
- **Component**: `ConfirmationDialog.jsx`
- Modal overlays that stay visible until user closes with × button
- Support for multiple variants (default, warning, danger)
- Used for:
  - Subscription renewal confirmation
  - Payment model switching
  - Cancellation confirmations
  - Payment method updates

### 5. Billing Dashboard
- **Page**: `MarketShopBilling.jsx`
- Centralized billing management interface
- Shop status monitoring
- Billing history (extensible)
- Payment settings

## Backend Functions

### 1. `updatePaymentMethod.js`
Updates a customer's payment method in Stripe
- Requires: subscriptionId, cardData
- Creates token from card data
- Updates Stripe customer default source
- Error handling and logging

### 2. `handlePaymentModelSwitch.js`
Schedules a payment model switch for the next billing cycle
- Validates subscription is active and in good standing
- Schedules change for next billing cycle
- Prevents switching if past due
- Stores pending switch in database

### 3. `handleSubscriptionRenewal.js`
Renews a cancelled subscription
- Only allows renewal of cancelled subscriptions
- Creates new Stripe subscription with same customer
- Updates database records
- Includes renewal metadata for tracking

## Entity Updates

### Subscription Entity
New fields added:
- `payment_model`: Current payment model (subscription/facilitation)
- `pending_model_switch`: Pending model switch
- `pending_switch_effective_date`: When switch becomes effective
- `facilitation_fee_percentage`: Fee percentage (default 5%)
- `total_facilitation_fees_paid`: Cumulative facilitation fees

## Integration Points

### In MarketShop Signup Flow
```jsx
import PaymentModelSelector from '@/components/marketshop/PaymentModelSelector';

<PaymentModelSelector 
  onSelect={(model) => {
    // Store selected model and create subscription
  }}
/>
```

### In MarketShop Dashboard
```jsx
import SubscriptionManager from '@/components/marketshop/SubscriptionManager';

<SubscriptionManager 
  shop={marketShopData}
  onSubscriptionUpdate={reloadData}
/>
```

### For Payment Method Updates Across Platform
```jsx
import PaymentMethodManager from '@/components/marketshop/PaymentMethodManager';

<PaymentMethodManager 
  subscription={subscriptionData}
  onClose={() => setShowManager(false)}
  onUpdate={reloadData}
/>
```

### For Confirmations
```jsx
import ConfirmationDialog from '@/components/marketshop/ConfirmationDialog';

<ConfirmationDialog
  title="Confirm Action"
  description="Are you sure?"
  confirmText="Proceed"
  onConfirm={handleConfirm}
  onClose={() => setShowDialog(false)}
  variant="warning"
/>
```

## User Flows

### Initial Setup
1. Vendor creates MarketShop account
2. PaymentModelSelector presented
3. Stripe checkout initiated for chosen model
4. Subscription record created in database
5. Shop set to active

### Renew Subscription
1. User clicks "Renew Subscription" button (only shows if cancelled)
2. ConfirmationDialog appears
3. Backend creates new Stripe subscription
4. Database updated with new subscription details
5. Success message displayed

### Switch Payment Models
1. User clicks "Switch Payment Model" button (only if active and in good standing)
2. ConfirmationDialog explains change takes effect next cycle
3. Backend schedules model switch
4. Change applies automatically at next billing date
5. User notified of effective date

### Update Payment Method
1. User clicks "Update Payment Method" button
2. PaymentMethodManager card form opens
3. User enters new card details
4. Backend creates Stripe token and updates customer
5. Success confirmation displayed

## Constraints & Business Rules

1. **Payment Required Before Services**
   - No services can be conducted without active subscription/fees
   - Past due accounts blocked from services

2. **Good Standing Requirement**
   - Must be active and in good standing to switch models
   - Past due subscriptions must be paid first

3. **Model Switch Timing**
   - Changes take effect at next billing cycle
   - Cannot switch if subscription is past due or cancelled

4. **Dialog Behavior**
   - Confirmation dialogs stay visible until × button clicked
   - Prevents accidental dismissal
   - Clear action outcomes

5. **Status Handling**
   - Cancelled: Can renew, cannot switch models
   - Active: Can switch, cancel, update payment
   - Past due: Must update payment before any changes

## Testing Checklist

- [ ] User can select payment model on signup
- [ ] Subscription appears in dashboard after checkout
- [ ] Renew button only shows for cancelled subscriptions
- [ ] Switch button only shows for active subscriptions in good standing
- [ ] Past due indicator displays correctly
- [ ] Payment method update creates Stripe token successfully
- [ ] Confirmation dialogs don't close on backdrop click
- [ ] Model switch schedules correctly for next billing cycle
- [ ] Shop services blocked when subscription is past due
- [ ] Billing history loads (stub implementation ready)

## Future Enhancements

- Billing history with invoice links
- Usage metrics for facilitation fee model
- Automatic late payment reminders
- Custom invoice email routing
- Multi-currency support
- Dunning management for failed payments