# Multiplication Trainer

A responsive web-based application to improve mental arithmetic skills, focusing on the 1x1 to 10x10 multiplication table. The app adapts dynamically to the user's progress, prioritizing unanswered and incorrect questions, and provides visual feedback to track learning progress.

## Features

- **Dynamic Questioning**: Randomly generates multiplication questions (1x1 to 10x10) with priority for unanswered or incorrect calculations.
- **Timer Configurable**: Default answer time is 10 seconds, adjustable by the user.
- **Result Matrix**:
  - Displays all multiplication questions with a color-coded success rate (from red to green).
  - Includes tooltips with details (e.g., number of attempts and correct answers).
- **Error List**:
  - Tracks incorrect answers for focused practice.
- **Progress Persistence**:
  - Saves results locally using browser storage (LocalStorage) so progress isn't lost when the page is reloaded.
- **Reset Functionality**:
  - Allows users to reset all progress and start fresh.
- **Mobile-Friendly**:
  - Fully responsive design with touch support for tooltips.

## Technologies Used

- **HTML**: Markup structure for the application.
- **CSS**: Styling for a clean, responsive interface, including color-coded feedback.
- **JavaScript**: Core logic for the quiz, timer, matrix updates, and local storage.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Feedback and Contributions
Feel free to open issues or submit pull requests to improve this project. Your contributions are welcome!
