# Christmas Gift Website 🎄💝

A Christmas-themed interactive website created with love.

## 📸 Required Images

Please create and add the following images to complete the website:

### Face Images (`images/faces/`)
**Format:** PNG with transparent background, 1000x1000px

**Required Files:**
- `face-default.png` - Your main neutral face
- `face-69.png` - Special face for 69 kisses milestone
- `face-228.png` - Special face for 228 kisses milestone
- `face-666.png` - Special face for 666 kisses milestone
- `face-1111.png` - Special face for 1111 kisses milestone

**Milestone Face Unlocks (with hats/costumes):**
- `face-10.png` - Unlocked at 10 kisses (e.g., with Santa hat)
- `face-25.png` - Unlocked at 25 kisses (e.g., with crown)
- `face-50.png` - Unlocked at 50 kisses (e.g., with party hat)
- `face-100.png` - Unlocked at 100 kisses (e.g., with wizard hat)
- `face-250.png` - Unlocked at 250 kisses (e.g., with pirate hat)
- `face-500.png` - Unlocked at 500 kisses (e.g., with chef hat)
- `face-1000.png` - Unlocked at 1000 kisses (e.g., with king crown)
- `face-boss.png` - Unlocked after beating boss (e.g., with hero hat)

### Effects (`images/effects/`)
- `mosquito.png` - Mosquito sprite for boss battle (200x200px, transparent PNG)

### Quiz Images (`images/quiz/`)
- Add any images referenced in your quiz questions

## 🎮 Customization

### Edit Compliments
Edit `data/compliments.json` to add/modify compliments shown in Panel 1.

### Edit Quiz Questions
Edit `data/quiz.json` to customize the quiz. Format:
```json
{
  "question": "Your question here?",
  "answers": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct": [0],
  "multipleChoice": false,
  "image": "optional-image.png"
}
```

- `correct`: Array of correct answer indices (0-based)
- `multipleChoice`: Set to `true` to allow multiple selections
- `image`: Optional image filename from `images/quiz/` folder

## 🚀 Deployment to GitHub Pages

1. Create a new private repository on GitHub
2. Push this code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Christmas gift website"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```
3. Go to Settings → Pages
4. Source: Deploy from branch `main`
5. Folder: `/ (root)`
6. Save and wait for deployment

Your website will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

## 📱 Features

### Panel 1: Compliment Generator
- Random compliments for 盈盈
- Colorful animated text
- Refresh button to get new compliment

### Panel 2: Relationship Counter
- Counts days since October 9, 2025
- Auto-updates daily

### Panel 3: Kiss Clicker Game
- Click to give kisses
- Face flips on each click
- 10% chance for golden kiss (10x multiplier)
- Unlock power upgrades (2x, 3x, 5x, 10x)
- Unlock hats at milestones
- Boss battle at 1500 kisses
- Progress saves automatically

### Panel 4: Quiz Game
- 10 questions about Oppa
- Supports images in questions
- Multiple choice support
- Score-based results

### Panel 5: Christmas Question
- Playful "Yes/No" question
- "No" button runs away
- Confetti celebration on "Yes"

## 🎨 Color Scheme

The website uses soft, pastel Christmas colors:
- Christmas Red: #E8A5A5
- Christmas Green: #A8D5A8
- Christmas Gold: #F4D19B
- Accent Pink: #FFB6C1
- Accent Blue: #B4D7E8

## 💾 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Notes

- All game progress is saved in browser localStorage
- Reset button available in clicker game
- Fully responsive for mobile and desktop
- Optimized for 14" laptops and Xiaomi 15 Pro (6.73")

---

Made with ❤️ for Christmas 🎅🎄
