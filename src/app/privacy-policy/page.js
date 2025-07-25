import React from "react";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | InsightCraft</title>
        <meta name="description" content="Læs vores privatlivspolitik for InsightCraft. Vi beskytter dine data og bruger dem kun til nødvendige formål." />
      </Head>
      <main>
        <h1>Privatlivspolitik for InsightCraft</h1>
        <section>
          <h2>Formål</h2>
          <p>
            InsightCraft indsamler og behandler kun de oplysninger, der er nødvendige for at levere vores tjenester. Vi videregiver ikke dine oplysninger til tredjepart uden dit samtykke.
          </p>
        </section>
        <section>
          <h2>Databrug</h2>
          <p>
            Vi bruger dine data udelukkende til at forbedre brugeroplevelsen og levere de ønskede funktioner. Vi anvender ikke cookies, tracking eller lignende teknologier.
          </p>
        </section>
        <section>
          <h2>Kontakt</h2>
          <p>
            Har du spørgsmål til vores privatlivspolitik, kan du kontakte os på:<br />
            E-mail: kontakt@insightcraft.dk
          </p>
        </section>
      </main>
    </>
  );
}
