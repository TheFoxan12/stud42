/*
Copyright © 2022 42Atomys

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
package cmd

import (
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"

	modelsutils "atomys.codes/stud42/internal/models"
	modelgen "atomys.codes/stud42/internal/models/generated"
	"atomys.codes/stud42/pkg/duoapi"
)

// campusCmd represents the campus command
var campusCmd = &cobra.Command{
	Use:   "campus",
	Short: "Crawl all campus of 42 network and update the database",
	Run: func(cmd *cobra.Command, args []string) {
		log.Info().Msg("Start the crawling of all campus of 42 network")
		if modelsutils.Connect() != nil {
			log.Fatal().Msg("Failed to connect to database")
		}

		campus, err := duoapi.CampusAll(cmd.Context())
		if err != nil {
			log.Fatal().Err(err).Msg("Failed to get duoapi response")
		}

		client := modelsutils.Client()
		for _, c := range campus {
			log.Debug().Msg("Creating campus " + c.Name)
			err := client.Campus.Create().
				SetActive(c.Active).
				SetAddress(c.Address).
				SetCity(c.City).
				SetCountry(c.Country).
				SetEmailExtension(c.EmailExtension).
				SetTwitter(c.Twitter).
				SetWebsite(c.Website).
				SetZip(c.Zip).
				SetDuoID(c.ID).
				SetName(c.Name).
				SetTimeZone(c.TimeZone).
				SetLanguageCode(c.Language.Identifier).
				OnConflict().
				DoNothing().
				Exec(cmd.Context())
			if err != nil {
				if modelgen.IsNotFound(err) {
					log.Debug().Msg("Campus " + c.Name + " already exists")
					continue
				}
				log.Error().Err(err).Msg("Failed to insert campus")
				continue
			}
			log.Info().Msg("Successfully import the campus of " + c.Name)
		}
		log.Info().Msgf("Successfully imported %d campus", len(campus))
	},
}

func init() {
	crawlerCmd.AddCommand(campusCmd)
}