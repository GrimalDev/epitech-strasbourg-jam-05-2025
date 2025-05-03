//go:build seeder
// +build seeder

package main

import (
	"flag"
	"log"

	"travelroot/seeder"
)

func main() {
	count := flag.Int("count", 10, "Number of hacking spots to seed")
	flag.Parse()

	if err := seeder.Run(*count); err != nil {
		log.Fatal(err)
	}
}
