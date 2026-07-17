package api

import (
	"fmt"
	"net/http"
)

func Health(w http.ResponseWriter, r *http.Request){
	fmt.Fprint(w, "Mercfow API funcionando")
}