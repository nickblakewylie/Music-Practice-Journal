# Music-Tracker
This app created with React Native allows users to store detailed practice sessions and view their progress over time.  This app uses the module expo camera to record the videos and store the videos in local storage on the users phone

# Screens
## Add Practice Page
### Overview
This page lets users add to add a practice session with inputs for practice time (mins), quality of session
which is a number 1 - 10, optional notes, and record a video.
### Details
When you are done inputing the information for the practice session click on the Save button, which will call function downloadFile().  This function moves the temporary file to a memory location on the device.  Next downloadFile will call the function storePracticeSession which stores all the details for the practiceSession into an array of PracticeSessions in local storage called 'practiceSessions'

