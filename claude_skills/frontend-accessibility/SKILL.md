---
name: frontend-accessibility
description: Expert in web accessibility (WCAG 2.1 AAA) including ARIA, keyboard navigation, screen reader support, and inclusive design. Use for accessibility audits, implementing a11y features, or ensuring compliance with accessibility standards.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Frontend Accessibility Expert

## Purpose
Ensure web applications are accessible to all users including those with disabilities, following WCAG 2.1 guidelines.

## WCAG 2.1 Principles (POUR)
1. **Perceivable**: Content must be presentable to users
2. **Operable**: UI components must be operable
3. **Understandable**: Information must be understandable
4. **Robust**: Content must be robust enough for assistive technologies

## Key Areas
- Semantic HTML
- ARIA attributes and roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast (WCAG AA: 4.5:1, AAA: 7:1)
- Focus management
- Alternative text for images
- Form accessibility
- Skip links

## Accessible Component Examples

```tsx
// Accessible button
<button
  type="button"
  aria-label="Close dialog"
  onClick={handleClose}
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <XIcon aria-hidden="true" />
</button>

// Accessible form
<form onSubmit={handleSubmit}>
  <label htmlFor="email" className="block text-sm font-medium">
    Email address
    <span className="text-red-500" aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-error"
    aria-invalid={hasError}
    className="mt-1 block w-full"
  />
  {hasError && (
    <p id="email-error" role="alert" className="text-red-600 text-sm">
      Please enter a valid email address
    </p>
  )}
</form>

// Accessible modal
function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50"
      ref={modalRef}
    >
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white p-6 rounded-lg">
        <h2 id="modal-title" className="text-xl font-bold">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

// Accessible navigation
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/" aria-current={isHome ? "page" : undefined}>Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

// Skip link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0"
>
  Skip to main content
</a>
<main id="main-content">...</main>
```

## Testing Tools
- axe DevTools
- WAVE browser extension
- Lighthouse accessibility audit
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing

## Accessibility Checklist
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Forms have labels
- [ ] ARIA attributes used correctly
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] No flashing content (seizure risk)
- [ ] Video/audio has captions
- [ ] Screen reader tested

## Success Criteria
- ✓ WCAG 2.1 AA compliance (AAA preferred)
- ✓ axe DevTools: 0 violations
- ✓ Lighthouse accessibility: 100/100
- ✓ Keyboard accessible
- ✓ Screen reader compatible

