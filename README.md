# Music Practice Logger
This app created with React Native allows users to store detailed practice sessions and view their progress over time.  By having musicans record information about the practice they become more focused and  This app uses the module expo camera to record the videos and store the videos in local storage on the users phone.

# Screens
## Add Practice Screen
### Overview
This page lets users add to add a practice session with inputs for practice time (mins), quality of session which is a number 1 - 10, optional notes, optional record a video, and optional select which song you are practicing.
### Details
When you are done inputing the information for the practice session click on the Save button, which will call function downloadFile().  This function moves the temporary file to a memory location on the device.  Next downloadFile will call the function storePracticeSession which stores all the details for the practiceSession into an array of PracticeSessions in local storage called 'practiceSessions'.
## Home Screen
### Overview
This page shows the user all their practice sessions organized from last week, this month, and this year.  This page also gives the user helpful stats, time practiced, average quality of each session and a graph of practice times.
### Details
Using the react context called practice sessions, which gets all the practice sesssion from local storage, the page will retrieve all the sessions associated with either last week, this month, or this year.  Using this information the amount of practice time is calculated and put into a chart

## Goal Screen 
### Overview
This page allows users to choose practice time goals daily, weekly, and monthly.  The page also calculates how much progress you have made towards all of your goals.
### Details
I store all the goals in local storage variables, dailyGoal, weeklyGoal, and monthlyGoal.  The calculations get updated whenever practiceSessions change or dailyGoal, weeklyGoal, or monthlyGoal changes.
## Set List Screen 
### Overview 
This screen is used to hold all the songs the user is working on.  It also calculates how much time the user has spent on each of the songs.  
## Details
This page allows users to add a song to their setlist with a song name, and a song difficulty. Also once a song has been added they have the ability to either delete the song or to change the difficulty of a song.
