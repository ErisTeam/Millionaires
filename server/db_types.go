package main

type Question struct {
    Id int
    Question string
    Difficulty int
    Impressions int
}

type Answer struct {
    Id int
    Question_id int
    Answer string
    Is_correct bool
    Chosen int
}

type Run struct {
    Id int
    Name string
    Started_at string
    Used_lifelines int
}

type RunQuestion struct {
    Id int
    Run_id int
    Question_id int
    Answer_id int
    Answered_at string
    Lifelines_used int
}
