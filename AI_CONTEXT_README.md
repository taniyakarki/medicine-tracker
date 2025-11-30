# AI Context Documentation

This document explains the AI context files created for the Medicine Track project.

## Files Created

### 1. `llms.txt` - Comprehensive LLM Context Documentation

**Purpose**: Provides detailed context for AI assistants (LLMs) working on this codebase.

**Contents**:
- **Project Overview**: Architecture, tech stack, and core principles
- **Project Structure**: Complete directory layout with explanations
- **Key Dependencies**: All packages with versions and purposes
- **Design System**: Colors, typography, spacing, shadows, layouts, gradients
- **Coding Patterns**: Component structure, hooks, utilities, database operations
- **React Native Patterns**: Modern React 19 and RN 0.81 best practices
- **Database Schema**: Complete table definitions with relationships
- **Common Tasks**: Step-by-step guides for adding screens, components, utilities, etc.
- **Performance Best Practices**: Optimization techniques
- **Accessibility Guidelines**: WCAG compliance patterns
- **Quick Reference**: Import paths and common code snippets
- **Version Information**: All package versions

**Size**: ~987 lines of comprehensive documentation

**Usage**: AI assistants should read this file to understand the project context before generating code.

### 2. `.cursorrules` - Cursor IDE Rules

**Purpose**: Enforces coding standards and patterns in Cursor IDE for both human developers and AI assistants.

**Contents**:
- **Primary Context Source**: Directs to read `llms.txt` first
- **Core Principles**: Reusability, separation of concerns, consistent UI, TypeScript, React patterns
- **Mandatory Patterns**: Code templates for components, hooks, and utilities
- **Design System Usage**: How to use colors, typography, spacing, etc.
- **File Organization**: Where to put new code
- **Code Quality Standards**: Error handling, loading states, validation
- **Database Operations**: Patterns for data access
- **Performance Guidelines**: Memoization, lists, images
- **Accessibility Requirements**: Interactive elements and colors
- **Testing Requirements**: Manual testing checklist
- **Git Commit Guidelines**: Commit message format
- **Anti-Patterns**: What to avoid and what to do instead
- **Quick Checklist**: Verification before submitting code

**Size**: ~430 lines of rules and guidelines

**Usage**: Cursor IDE automatically applies these rules. AI assistants in Cursor will follow these guidelines.

### 3. `AI_CONTEXT_README.md` - This File

**Purpose**: Explains the AI context documentation system.

## How It Works

### For AI Assistants (LLMs)

1. **Read `llms.txt` first**: This provides comprehensive project context
2. **Follow `.cursorrules`**: These enforce the patterns documented in `llms.txt`
3. **Reference when needed**: Both files serve as reference during code generation

### For Human Developers

1. **Cursor IDE Integration**: `.cursorrules` is automatically loaded by Cursor
2. **Reference Guide**: `llms.txt` serves as a comprehensive reference
3. **Onboarding**: New developers can read these files to understand the project

## Key Principles Enforced

### 1. Reusability First
- Never duplicate code
- Extract common logic to utilities
- Create reusable components
- Use custom hooks for shared logic

### 2. Separation of Concerns
- **NEVER** put helper functions inside components
- Extract to `/lib/utils`
- Business logic in `/lib`
- UI components in `/components`
- Database operations in `/lib/database/models`

### 3. Consistent UI
- All UI components from `/components/ui`
- Use design tokens from `/constants/design.ts`
- Support dark mode
- Never hardcode colors or spacing

### 4. Type Safety
- Strict TypeScript
- Proper interfaces for props
- Type all function parameters and returns
- No `any` types

### 5. Modern React Patterns
- React 19 features
- Functional components with hooks
- Proper memoization
- Error boundaries

### 6. React Native Best Practices
- React Native 0.81.5 patterns
- StyleSheet for static styles
- Platform-specific code when needed
- Performance optimization

## Project Structure Quick Reference

```
/app                    # Screens (Expo Router)
/components            # Reusable components
  /ui                  # Generic UI components
  /medicine            # Medicine-specific components
/lib                   # Business logic
  /database            # Database layer
  /notifications       # Notification system
  /hooks               # Custom hooks
  /utils               # Utility functions
  /context             # React contexts
/constants             # Design system
/types                 # TypeScript types
/docs                  # Documentation
```

## Design System

All design tokens are centralized in `/constants/design.ts`:
- **Colors**: Light and dark mode colors
- **Typography**: Font sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Border Radius**: Rounded corners
- **Shadows**: Elevation levels
- **Layout**: Common dimensions
- **Gradients**: Color gradients

## Common Tasks

### Adding a New Screen
1. Create in `/app/[path]/[name].tsx`
2. Use default export
3. Follow screen pattern in `llms.txt`

### Adding a New Component
1. Create in `/components/ui` or `/components/[feature]`
2. Use named export
3. Support dark mode
4. Use design tokens

### Adding a New Utility
1. Create in `/lib/utils/[category]-helpers.ts`
2. Pure functions
3. Proper TypeScript types
4. Export as named export

### Adding a New Hook
1. Create in `/lib/hooks/use[Name].ts`
2. Return loading, error, data, refresh
3. Implement caching
4. Use useCallback

## Testing Checklist

Before considering code complete:
- [ ] Light mode
- [ ] Dark mode
- [ ] Loading state
- [ ] Error state
- [ ] Empty state
- [ ] Pull-to-refresh
- [ ] Navigation flow
- [ ] Form validation
- [ ] iOS behavior
- [ ] Android behavior

## Maintenance

### When to Update llms.txt
- Adding new architectural patterns
- Introducing new conventions
- Adding new utilities or helpers
- Creating new component patterns
- Changing project structure

### When to Update .cursorrules
- Changing coding standards
- Adding new mandatory patterns
- Updating anti-patterns
- Modifying file organization

## Benefits

### For AI Assistants
- Comprehensive context for code generation
- Consistent code patterns
- Proper architecture understanding
- Design system awareness

### For Developers
- Clear coding standards
- Consistent codebase
- Easy onboarding
- Reference documentation

### For the Project
- Maintainable codebase
- Consistent patterns
- High code quality
- Scalable architecture

## Version Information

- **Created**: November 30, 2025
- **Expo SDK**: 54.0.25
- **React**: 19.1.0
- **React Native**: 0.81.5
- **TypeScript**: 5.9.2

## Additional Resources

- Main documentation: `/docs/README.md`
- Features guide: `/FEATURES.md`
- Implementation plan: `/Plan.md`
- Known warnings: `/docs/KNOWN_WARNINGS.md`

---

**Note**: These files are living documents. Update them as the project evolves to maintain their usefulness.

