# Requirements: Claude Code Statusline Configurator

**Defined:** 2026-03-10
**Core Value:** Generate a customized statusline script instantly — no manual editing, no guesswork about field names or format.

## v1 Requirements

### Configuration

- [x] **CONF-01**: User can toggle individual statusline fields on/off
- [x] **CONF-02**: User can reorder selected fields using up/down arrow buttons
- [ ] **CONF-03**: User can select a separator from named presets: pipe ( | ), dash ( - ), dot ( . ), space, slash ( / )
- [x] **CONF-04**: Model name field is pre-selected by default on page load
- [x] **CONF-05**: All field definitions are data-driven from a single source (fields registry)

### Preview

- [ ] **PREV-01**: Live statusline preview updates instantly as user toggles fields, reorders, or changes separator
- [ ] **PREV-02**: Preview displays realistic example values for each field (not placeholder text)

### Output

- [ ] **OUTP-01**: Generated bash script updates live to reflect current field selection, order, and separator
- [ ] **OUTP-02**: Generated script is displayed with syntax highlighting
- [ ] **OUTP-03**: User can copy the generated script with one click
- [ ] **OUTP-04**: Copy button shows visual confirmation feedback after copying
- [ ] **OUTP-05**: Copy button handles clipboard failures gracefully (HTTPS guard, execCommand fallback)
- [ ] **OUTP-06**: Install instructions are shown alongside the script (where to save it: `~/.claude/statusline.sh`)

### Design

- [x] **DSGN-01**: UI uses a hacker-but-polished terminal aesthetic (dark background, terminal color palette, monospace font, subtle glows/animations)
- [x] **DSGN-02**: All interactive controls use semantic HTML elements (buttons, not divs) for keyboard accessibility
- [x] **DSGN-03**: Color tokens meet WCAG AA contrast requirements (4.5:1 minimum)

### Technical

- [x] **TECH-01**: Site is fully static (no backend, no API calls at runtime)
- [x] **TECH-02**: No hydration mismatch errors (SSR boundary and mounted guard established)
- [x] **TECH-03**: Bash script generator correctly escapes special characters in separator values

## v2 Requirements

### Sharing

- **SHAR-01**: User can generate a permalink URL that restores their exact configuration
- **SHAR-02**: Page reads config from URL hash on load and pre-applies it

### Installation

- **INST-01**: Page shows a one-line curl/bash install command that auto-saves the script to the correct location

### Advanced Configuration

- **CONF-06**: User can enter a custom separator string (free-text, validated)
- **CONF-07**: User can save/restore named configuration presets (localStorage)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / API | Tool is fully stateless — no server needed |
| User accounts | No persistence requirement for v1 |
| OAuth / login | No user data to protect |
| Mobile-optimized layout | Developer tool — desktop primary; functional on mobile is sufficient |
| Dark/light mode toggle | Terminal aesthetic is always dark; this isn't a trade-off |
| Drag-and-drop reordering | Up/down arrows are simpler, keyboard-friendly, and sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONF-01 | Phase 2 | Complete |
| CONF-02 | Phase 2 | Complete |
| CONF-03 | Phase 2 | Pending |
| CONF-04 | Phase 2 | Complete |
| CONF-05 | Phase 1 | Complete |
| PREV-01 | Phase 2 | Pending |
| PREV-02 | Phase 2 | Pending |
| OUTP-01 | Phase 3 | Pending |
| OUTP-02 | Phase 3 | Pending |
| OUTP-03 | Phase 3 | Pending |
| OUTP-04 | Phase 3 | Pending |
| OUTP-05 | Phase 3 | Pending |
| OUTP-06 | Phase 3 | Pending |
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 1 | Complete |
| DSGN-03 | Phase 1 | Complete |
| TECH-01 | Phase 1 | Complete |
| TECH-02 | Phase 1 | Complete |
| TECH-03 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after 01-02 execution*
