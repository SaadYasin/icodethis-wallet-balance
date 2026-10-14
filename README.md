# Wallet Balance & Payment Requests

A responsive, front-end wallet dashboard demo for viewing a sample balance and managing sample payment requests. It is a standalone interface prototype: it does not connect to a real account, send payments, or move money.

## Features

- Displays a sample wallet balance and pending payment requests.
- Switches between Pending and Completed request tabs. The Completed tab is an empty-state placeholder.
- Provides demo actions to send a reminder, edit a request amount, or cancel a request.
- Includes an account-menu popover, confirmation and edit dialogs, and toast notifications.
- Supports keyboard navigation, visible focus indicators, and reduced-motion preferences.
- Adapts to smaller screens.

## Run locally

No build step or package installation is required. Open `index.html` in a modern browser, using live server extension

The page loads Tailwind CSS from its CDN and the Source Sans 3 font from Google Fonts, so those resources require an internet connection. The core interface files are:

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, content, and Tailwind configuration |
| `style.css` | Custom styling and interaction animations |
| `script.js` | Sample request data and interactive behavior |

## Using the demo

- Select **Pending** or **Completed** to switch request panels.
- Use **Send a reminder** to show a demo-only notification.
- Use **Edit amount** to change a request amount; enter a positive number.
- Use **Cancel** and confirm to remove a request from the pending list.
- Open the menu or select the other top navigation items to see demo notices; those destinations are not implemented.

Changes are held in memory only and reset when the page is reloaded. The displayed balance is static and is not changed by request actions. All account details and requests are sample data.
