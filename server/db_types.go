package main

type Run struct {
	Id             int
	Name           string
	Started_at     string
	Used_lifelines int
}

type RunQuestion struct {
	Id             int
	Run_id         int
	Question_id    int
	Answer_id      int
	Answered_at    string
	Lifelines_used int
}
