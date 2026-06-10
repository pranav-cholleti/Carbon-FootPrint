# Developer Contribution Guide — Imprint Carbon Footprint Platform

Welcome! Please review these guidelines before submitting code contributions to the Imprint repository to maintain our high **Code Quality** standards.

---

## 1. Code Modularity & Line Limits

* **Max File Length**: No source code file (e.g. components, routes, libraries) should exceed **300 lines** of code.
* **Extraction Policy**: If a file grows beyond 300 lines during feature additions:
  - Extract visual sub-sections into child components under local sub-directories.
  - Move helper functions to utility files or local sub-modules.
  - Separate static config parameters or mocks into dedicated data files (e.g. `seedData.ts` or `library.ts`).

---

## 2. Documentation & JSDoc Standards

* **JSDocs**: Every exported function, custom react hook, and React component **must have a formal JSDoc block**.
* **JSDoc Template**:
  ```typescript
  /**
   * Short one-line description of function.
   *
   * @param {ParamType} parameterName - Parameter details.
   * @returns {ReturnType} Description of return values.
   */
  ```
* **Inline Comments**: Use descriptive double-slash `//` inline comments to clarify:
  - Complex math and conversion calculations.
  - Browser safety checks (`window` / `localStorage` queries).
  - Component mount state handlers (preventing hydration mismatches).

---

## 3. Web Accessibility (A11y) Standards

Ensure all user interface files satisfy the following checklist before submitting pull requests:
1. **Interactive Controls**: Buttons, anchors, and inputs must contain explicit descriptions.
2. **Screen Reader Assist**:
   - Navigation links must declare `aria-label` descriptions.
   - The active link representing the current page must state `aria-current="page"`.
   - Toggle buttons must state `aria-pressed`.
3. **Form Associations**: All inputs, sliders, and selects must have an associated `<label>` tag with matching `htmlFor` and input `id` attributes.
4. **Decorative Elements**: Non-interactive icons and SVG graphics must include `aria-hidden="true"`.

---

## 4. Lint and Test Verifications

Before pushing code to remote, always execute local validations:

```bash
# Run lint check (0 errors & 0 warnings required)
npm run lint

# Run Vitest unit tests (100% pass required)
npm run test
```
