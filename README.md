# Music Practice Logger
## [Link to App on App Store](https://apps.apple.com/us/app/music-practice-journal/id1612882454)
This app created with React Native allows users to store detailed practice sessions and view their progress over time.  By having musicans record information about the practice they become more focused and  This app uses the module expo camera to record the videos and store the videos in local storage on the users phone.

# Screens
## Add Practice Screen
<img src='https://user-images.githubusercontent.com/77705797/182207563-9c260308-e6a6-45c1-a21f-15f91125f4cd.png'  width=200 />

### Overview
This page lets users add to add a practice session with inputs for practice time (mins), quality of session which is a number 1 - 10, optional notes, optional record a video, and optional select which song you are practicing.
### Details
When you are done inputing the information for the practice session click on the Save button, which will call function downloadFile().  This function moves the temporary file to a memory location on the device.  Next downloadFile will call the function storePracticeSession which stores all the details for the practiceSession into an array of PracticeSessions in local storage called 'practiceSessions'.

## Home Screen
 <img src=https://user-images.githubusercontent.com/77705797/182207642-61f588d8-269e-4c40-aa49-e8b61390fd30.png width=200/>
 
### Overview
This page shows the user all their practice sessions organized from last week, this month, and this year.  This page also gives the user helpful stats, time practiced, average quality of each session and a graph of practice times.

### Details
Using the react context called practice sessions, which gets all the practice sesssion from local storage, the page will retrieve all the sessions associated with either last week, this month, or this year.  Using this information the amount of practice time is calculated and put into a chart

## Goal Screen 
<img src=https://user-images.githubusercontent.com/77705797/182207738-d25aff94-a99e-40df-b816-d699eaf4c525.png width=200/>

### Overview
This page allows users to choose practice time goals daily, weekly, and monthly.  The page also calculates how much progress you have made towards all of your goals.
### Details
I store all the goals in local storage variables, dailyGoal, weeklyGoal, and monthlyGoal.  The calculations get updated whenever practiceSessions change or dailyGoal, weeklyGoal, or monthlyGoal changes.

## Set List Screen 
<img src=https://user-images.githubusercontent.com/77705797/182207919-311d41e0-baee-487d-ad61-6a95341a8074.png width=200/>

### Overview 
This screen is used to hold all the songs the user is working on.  It also calculates how much time the user has spent on each of the songs.  
## Details
This page allows users to add a song to their setlist with a song name, and a song difficulty. Also once a song has been added they have the ability to either delete the song or to change the difficulty of a song.

# To run the application
Clone the github repository and run the command expo start.  Next press i to run in an ios simulator.  Note this project is intended for ios and has not been tested for web or andriod use. 
