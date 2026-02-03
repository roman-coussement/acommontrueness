# Personal Website

Minimalist personal website built with pure HTML and CSS. Hosted on GitHub Pages.

## File Structure

```
/
├── index.html          # Homepage listing all posts
├── style.css           # Global styles
├── posts/              # Individual article pages
│   ├── template.html   # Template for new posts
│   └── *.html          # Published articles
└── assets/             # Images and icons
    ├── images/
    └── icons/
```

## Adding New Posts

### Method 1: Manual HTML (Current)

1. Copy `posts/template.html` to `posts/your-new-post.html`
2. Edit the new file:
   - Update `<title>` and meta description
   - Change the `<time>` datetime attribute and display text
   - Replace `[ARTICLE TITLE]` with your title
   - Fill in the `.article-body` with your content
3. Add entry to homepage `index.html`:

```html
<article class="post-item">
    <a href="posts/your-new-post.html" class="post-link">
        <div class="post-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 1H3.5C2.67157 1 2 1.67157 2 2.5V13.5C2 14.3284 2.67157 15 3.5 15H12.5C13.3284 15 14 14.3284 14 13.5V6M9 1L14 6M9 1V5.5C9 5.77614 9.22386 6 9.5 6H14"/>
            </svg>
        </div>
        <div class="post-content">
            <h3 class="post-title">Your New Post Title</h3>
            <p class="post-description">Short description</p>
        </div>
        <div class="post-arrow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 3L11 8L6 13"/>
            </svg>
        </div>
    </a>
</article>
```

4. Commit and push to GitHub

### Future: Static Site Generator

Plan to migrate to 11ty for Markdown-based content management.

## Customization

Replace placeholder values across all HTML files:

- `[YOUR NAME]` — Your full name
- `[YOUR TITLE]` — Your job title or role
- `[COMPANY NAME]` — Your company or organization
- `[USERNAME]` — Your Twitter/X and GitHub username

## Design System

### Colors

- Text Primary: `#111827`
- Text Body: `#374151`
- Text Secondary: `#6b7280`
- Text Tertiary: `#9ca3af`
- Link Blue: `#3b82f6`
- Background: `#ffffff`
- Border: `#e5e7eb`

### Typography

- Font Stack: System fonts (-apple-system, BlinkMacSystemFont, etc.)
- Base Size: 16px
- Line Height: 1.5 (body), 1.7 (article)

### Spacing Scale

- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px
- 3XL: 64px

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari (latest)
- Chrome Mobile (latest)

## License

MIT License — see [LICENSE](LICENSE) for details.
