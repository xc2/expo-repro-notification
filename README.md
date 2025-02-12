# Minimal reproducible for duplicate notification from `expo-notification`

## Steps to reproduce

1. start: `pnpm run prebuild && pnpm run start`
1. Wait for the main screen to appear, and allow notifications
1. Send push via `pnpm run push`
1. Tap the notification **(A)**
1. Tap the button "Start/Restart listening", **(A)** will appear in the list 
1. Tap the button "Start/Restart listening" again, **(A)** will duplicate in the list
    1. **Expected:** Nothing should happen
1. Send push again and tap the notification, a new notification **(B)** will appear in the list
1. Tap the button "Start/Restart listening" again, **(A)** will duplicate in the list
    1. **Expected:** Nothing should happen
1. Tap the button "Stop listening"
1. Send push again and tap the notification **(C)**
1. Tap the button "Start/Restart listening" again, **(A)** and **(C)** will be prepended to the list
    1. **Expected:** Only **(C)** should be prepended to the list
1. Tap the button "Start/Restart listening" again, **(A)** and **(C)** will duplicate in the list
    1. **Expected:** Nothing should happen

## Screen recording

https://github.com/user-attachments/assets/9df37a35-3a83-4563-be97-c18b7c297466

