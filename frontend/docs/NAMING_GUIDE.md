# Naming Guide

## Purpose

This document defines the naming conventions used throughout this project.

The goal of naming is **not** to make code shorter.

The goal of naming is to make code immediately understandable.

When choosing between a shorter name and a clearer name, always prefer the clearer one.

This guide documents **project-specific naming decisions**, not general JavaScript conventions.

---

# General Principles

* Use English for all identifiers.
* Prefer descriptive names over short names.
* Choose clarity over brevity.
* Use one term consistently across the entire project.
* Every name should describe its purpose without additional explanation.
* Avoid unnecessary abbreviations unless they are widely known.

---

# Domain Terminology

Use consistent terminology across the project.

Current decisions:

* Use `coin` instead of `asset` when referring to a cryptocurrency.
* Do not use different names for the same concept.
* If a naming decision changes, update the project consistently.

Examples:

✅ `coin`

✅ `marketCoin`

✅ `portfolioCoin`

✅ `selectedCoin`

Avoid:

❌ Mixing `asset` and `coin` for the same concept.

Consistency is more important than personal preference.

---

# Variables

Variable names should describe what they store.

Good examples:

```ts
coin
marketCoin
portfolioCoin
selectedCoin
currentAmount
currentPrice
total
formValues
```

Avoid generic names such as:

```ts
data
item
obj
temp
value
```

unless their meaning is obvious from the context.

---

# Collections

Collections should use plural names.

Examples:

```ts
coins
marketCoins
portfolioCoins
transactions
```

Avoid unnecessary suffixes such as:

```ts
coinList
coinsArray
```

The plural form is usually enough.

---

# Boolean Variables

Boolean variables should answer a yes/no question.

Prefer prefixes:

* `is`
* `has`
* `can`
* `should`

Examples:

```ts
isCoinAdded
isLoading
isOpen
hasError
canSubmit
```

Avoid unclear names such as:

```ts
added
loadingState
opened
```

---

# Functions

Function names should start with a verb.

Examples:

```ts
handleSubmit
handleSelectCoin
saveCoin
addCoinToPortfolio
resetForm
loadMarketData
```

Function names should describe **what** they do, not **how** they do it.

---

# Event Handlers

UI event handlers should start with `handle`.

Not every function must start with `handle`.

Descriptive verbs such as `save`, `load`, `reset`, and `calculate` are valid when they clearly describe what the function does.

Examples:

```ts
handleSubmit
handleSelectCoin
handleReset
handleClose
```

---

# Components

Component names should describe the UI element or feature they represent.

Use PascalCase.

Examples:

```tsx
AddCoinForm
CoinCard
CoinInfo
PortfolioChart
AppHeader
```

---

# Props

Prop names should follow the same terminology as the rest of the project.

Examples:

```ts
coin
setCoin
isCoinAdded
closeCoinDrawer
```

Avoid introducing different terms for the same concept.

Example:

❌ `setAssetAdded`

✅ `setIsCoinAdded`

---

# Constants

Constants should have descriptive names that explain their purpose.

Examples:

```ts
validationMessages
apiBaseUrl
defaultPortfolio
headerStyle
contentStyle
```

---

# Before Renaming

Before renaming any identifier, ask yourself:

* Does the new name explain the intent better?
* Is it consistent with the rest of the project?
* Will another developer understand it more easily?
* Does the rename provide real value?

Do **not** rename code only because another name sounds better.

---

# What We Avoid

We intentionally avoid:

* unnecessary abbreviations;
* inconsistent terminology;
* vague names;
* different names for the same concept;
* names that require comments to be understood;
* renaming code without a clear benefit.

---

# Evolution

Naming conventions are not fixed forever.

If a better naming approach appears:

1. Discuss it.
2. Evaluate the benefits.
3. Reach a shared decision.
4. Update this guide.
5. Apply the new terminology consistently.

Consistency is more important than perfection.

---

# Final Rule

Good naming reduces the need for comments.

If a name needs an explanation, consider improving the name first.
