/**
 * Starter content shipped with the website.
 *
 * Two uses:
 *   1. `npm run seed` writes it into the CMS (every entry flagged `isPlaceholder`);
 *   2. the public site renders it as a fallback when the CMS is disabled or
 *      unreachable, so the site never breaks and never shows an empty shell.
 *
 * RULES FOLLOWED HERE — do not break them when editing:
 *   • No invented client, partner, diploma, assignment, figure or testimonial.
 *   • Anything that must come from the owner is written between [square brackets].
 *   • Descriptions of expertise areas describe the *discipline*, never a claim
 *     about a specific track record.
 */

import type { Locale } from '@/i18n/routing'

export type Localized<T = string> = Record<Locale, T>

export type StarterExpertise = {
  key: string
  icon: string
  order: number
  title: Localized
  summary: Localized
  intro: Localized
  challenges: Localized<string[]>
  services: Localized<{ title: string; description: string }[]>
  audiences: Localized<string[]>
  approach: Localized
}

export const starterExpertise: StarterExpertise[] = [
  {
    key: 'corporate-finance',
    icon: 'chart',
    order: 10,
    title: {
      en: 'Corporate Finance & Financial Analysis',
      fr: 'Corporate finance et analyse financière',
      de: 'Corporate Finance & Finanzanalyse',
    },
    summary: {
      en: 'Reading the numbers behind a business: profitability, cash, financing structure and the decisions they justify.',
      fr: 'Lire les chiffres derrière une entreprise : rentabilité, trésorerie, structure de financement et décisions associées.',
      de: 'Die Zahlen hinter einem Unternehmen lesen: Rentabilität, Liquidität, Finanzierungsstruktur und die daraus folgenden Entscheidungen.',
    },
    intro: {
      en: 'Financial analysis is not an accounting exercise: it is the discipline of turning statements, budgets and forecasts into decisions a management team can defend. This area covers analysis of historical performance, financial modelling, capital structure and the preparation of financing files.',
      fr: "L'analyse financière n'est pas un exercice comptable : c'est la discipline qui transforme des états, des budgets et des prévisions en décisions défendables par une direction. Ce domaine couvre l'analyse de la performance passée, la modélisation financière, la structure de capital et la préparation des dossiers de financement.",
      de: 'Finanzanalyse ist keine Buchhaltungsübung: Sie überführt Abschlüsse, Budgets und Prognosen in Entscheidungen, die eine Geschäftsführung vertreten kann. Dieser Bereich umfasst die Analyse der historischen Performance, Finanzmodellierung, Kapitalstruktur und die Aufbereitung von Finanzierungsunterlagen.',
    },
    challenges: {
      en: [
        'Results are known but not understood — nobody can explain the margin variation.',
        'Cash is tight while the profit and loss statement looks healthy.',
        'A financing file has to be assembled for a bank or an investor.',
        'Budgets are built bottom-up without a link to strategy.',
      ],
      fr: [
        'Les résultats sont connus mais pas compris — personne ne sait expliquer la variation de marge.',
        'La trésorerie est tendue alors que le compte de résultat paraît sain.',
        'Un dossier de financement doit être constitué pour une banque ou un investisseur.',
        'Les budgets sont construits sans lien avec la stratégie.',
      ],
      de: [
        'Die Ergebnisse sind bekannt, aber nicht verstanden — niemand kann die Margenveränderung erklären.',
        'Die Liquidität ist knapp, obwohl die GuV gesund aussieht.',
        'Für eine Bank oder einen Investor muss ein Finanzierungsdossier erstellt werden.',
        'Budgets entstehen ohne Verbindung zur Strategie.',
      ],
    },
    services: {
      en: [
        {
          title: 'Financial diagnosis',
          description: 'Profitability, working capital, break-even and cash conversion.',
        },
        {
          title: 'Financial modelling',
          description: 'Three-statement models, scenarios and sensitivity analysis.',
        },
        {
          title: 'Financing files',
          description: 'Structuring and documenting a request for banks or investors.',
        },
        {
          title: 'Budgeting & controlling',
          description: 'Budget construction, variance analysis and management reporting.',
        },
      ],
      fr: [
        {
          title: 'Diagnostic financier',
          description:
            'Rentabilité, besoin en fonds de roulement, seuil de rentabilité et conversion de trésorerie.',
        },
        {
          title: 'Modélisation financière',
          description: 'Modèles à trois états, scénarios et analyses de sensibilité.',
        },
        {
          title: 'Dossiers de financement',
          description:
            "Structuration et documentation d'une demande pour banques ou investisseurs.",
        },
        {
          title: 'Budget et contrôle de gestion',
          description: 'Construction budgétaire, analyse des écarts et reporting de pilotage.',
        },
      ],
      de: [
        {
          title: 'Finanzdiagnose',
          description: 'Rentabilität, Working Capital, Break-even und Cash Conversion.',
        },
        {
          title: 'Finanzmodellierung',
          description: 'Drei-Statement-Modelle, Szenarien und Sensitivitätsanalysen.',
        },
        {
          title: 'Finanzierungsdossiers',
          description: 'Strukturierung und Dokumentation einer Anfrage für Banken oder Investoren.',
        },
        {
          title: 'Budgetierung & Controlling',
          description: 'Budgetaufbau, Abweichungsanalyse und Management-Reporting.',
        },
      ],
    },
    audiences: {
      en: [
        'SME management teams',
        'Finance departments',
        'Investors and lenders',
        'Public programmes',
      ],
      fr: [
        'Directions de PME',
        'Directions financières',
        'Investisseurs et prêteurs',
        'Programmes publics',
      ],
      de: [
        'KMU-Geschäftsführungen',
        'Finanzabteilungen',
        'Investoren und Kreditgeber',
        'Öffentliche Programme',
      ],
    },
    approach: {
      en: 'Start from the questions the decision-maker actually has, rebuild the figures that answer them, and hand over a model the team can keep using without me.',
      fr: "Partir des questions que se pose réellement le décideur, reconstruire les chiffres qui y répondent, et transmettre un modèle que l'équipe pourra continuer à utiliser sans moi.",
      de: 'Bei den tatsächlichen Fragen der Entscheider ansetzen, die Zahlen dazu rekonstruieren und ein Modell übergeben, das das Team ohne mich weiterführen kann.',
    },
  },
  {
    key: 'financial-due-diligence',
    icon: 'magnifier',
    order: 20,
    title: {
      en: 'Financial Due Diligence',
      fr: 'Due diligence financière',
      de: 'Financial Due Diligence',
    },
    summary: {
      en: 'Verifying what a business is really worth before an acquisition, an investment or a partnership.',
      fr: 'Vérifier ce que vaut réellement une entreprise avant une acquisition, un investissement ou un partenariat.',
      de: 'Prüfen, was ein Unternehmen wirklich wert ist — vor Akquisition, Investment oder Partnerschaft.',
    },
    intro: {
      en: 'Due diligence answers one question: what am I actually buying? The work consists of testing reported earnings, normalising them, identifying the liabilities that do not appear on the balance sheet and translating the findings into negotiation arguments.',
      fr: "La due diligence répond à une seule question : qu'est-ce que j'achète réellement ? Le travail consiste à tester les résultats publiés, les normaliser, identifier les engagements qui n'apparaissent pas au bilan et traduire les constats en arguments de négociation.",
      de: 'Due Diligence beantwortet eine Frage: Was kaufe ich tatsächlich? Die Arbeit besteht darin, ausgewiesene Ergebnisse zu prüfen, zu normalisieren, nicht bilanzierte Verpflichtungen zu identifizieren und Feststellungen in Verhandlungsargumente zu übersetzen.',
    },
    challenges: {
      en: [
        'The seller presents adjusted figures that cannot be traced back to the accounts.',
        'Recurring and one-off earnings are mixed.',
        'Working capital requirements are underestimated in the business plan.',
        'Off-balance-sheet commitments surface after signing.',
      ],
      fr: [
        'Le vendeur présente des chiffres retraités impossibles à rapprocher de la comptabilité.',
        'Les résultats récurrents et exceptionnels sont mélangés.',
        'Le besoin en fonds de roulement est sous-estimé dans le business plan.',
        'Des engagements hors bilan apparaissent après la signature.',
      ],
      de: [
        'Der Verkäufer legt bereinigte Zahlen vor, die sich nicht auf die Buchhaltung zurückführen lassen.',
        'Wiederkehrende und einmalige Ergebnisse sind vermischt.',
        'Der Working-Capital-Bedarf ist im Businessplan unterschätzt.',
        'Außerbilanzielle Verpflichtungen tauchen erst nach der Unterzeichnung auf.',
      ],
    },
    services: {
      en: [
        {
          title: 'Quality of earnings',
          description: 'Normalisation of results and identification of non-recurring items.',
        },
        {
          title: 'Cash and working capital',
          description: 'Analysis of seasonality, financing needs and net debt.',
        },
        {
          title: 'Risk mapping',
          description: 'Contractual, tax and operational exposures relevant to the price.',
        },
        {
          title: 'Red flag report',
          description: 'A short, decision-ready summary for the investment committee.',
        },
      ],
      fr: [
        {
          title: 'Qualité des résultats',
          description: 'Normalisation des résultats et identification des éléments non récurrents.',
        },
        {
          title: 'Trésorerie et BFR',
          description:
            'Analyse de la saisonnalité, des besoins de financement et de la dette nette.',
        },
        {
          title: 'Cartographie des risques',
          description:
            'Expositions contractuelles, fiscales et opérationnelles ayant un impact sur le prix.',
        },
        {
          title: 'Rapport red flag',
          description:
            "Une synthèse courte, directement exploitable par le comité d'investissement.",
        },
      ],
      de: [
        {
          title: 'Ergebnisqualität',
          description: 'Normalisierung der Ergebnisse und Identifikation einmaliger Effekte.',
        },
        {
          title: 'Liquidität und Working Capital',
          description: 'Analyse von Saisonalität, Finanzierungsbedarf und Nettoverschuldung.',
        },
        {
          title: 'Risikolandkarte',
          description: 'Vertragliche, steuerliche und operative Risiken mit Preisrelevanz.',
        },
        {
          title: 'Red-Flag-Bericht',
          description:
            'Eine kurze, entscheidungsreife Zusammenfassung für das Investment Committee.',
        },
      ],
    },
    audiences: {
      en: [
        'Investors and funds',
        'Buyers of SMEs',
        'Banks and lenders',
        'Development finance institutions',
      ],
      fr: [
        'Investisseurs et fonds',
        'Repreneurs de PME',
        'Banques et prêteurs',
        'Institutions de financement du développement',
      ],
      de: [
        'Investoren und Fonds',
        'KMU-Käufer',
        'Banken und Kreditgeber',
        'Entwicklungsfinanzierungsinstitutionen',
      ],
    },
    approach: {
      en: 'Evidence over narrative. Every adjustment is traceable to a source document, and every finding is expressed as an impact on price, structure or conditions.',
      fr: "Les preuves avant le récit. Chaque retraitement est traçable jusqu'à une pièce justificative, et chaque constat est exprimé en impact sur le prix, la structure ou les conditions.",
      de: 'Belege vor Erzählung. Jede Anpassung ist bis zum Quelldokument nachvollziehbar, jede Feststellung wird als Auswirkung auf Preis, Struktur oder Konditionen ausgedrückt.',
    },
  },
  {
    key: 'business-development-sme',
    icon: 'growth',
    order: 30,
    title: {
      en: 'Business Development & SME Advisory',
      fr: 'Business development et conseil aux PME',
      de: 'Business Development & KMU-Beratung',
    },
    summary: {
      en: 'Helping small and medium businesses move from opportunistic growth to a structured, financeable model.',
      fr: "Aider les PME à passer d'une croissance opportuniste à un modèle structuré et finançable.",
      de: 'KMU dabei unterstützen, von opportunistischem Wachstum zu einem strukturierten, finanzierbaren Modell zu gelangen.',
    },
    intro: {
      en: 'Most SMEs do not fail for lack of ideas but for lack of structure: unclear offer, unpriced services, no pipeline, no cash discipline. This area covers commercial structuring, pricing, organisation and the operational routines that make growth sustainable.',
      fr: "La plupart des PME n'échouent pas par manque d'idées mais par manque de structure : offre floue, prestations mal tarifées, absence de pipeline, absence de discipline de trésorerie. Ce domaine couvre la structuration commerciale, la tarification, l'organisation et les routines opérationnelles qui rendent la croissance soutenable.",
      de: 'Die meisten KMU scheitern nicht an fehlenden Ideen, sondern an fehlender Struktur: unklares Angebot, nicht kalkulierte Leistungen, keine Pipeline, keine Liquiditätsdisziplin. Dieser Bereich umfasst kommerzielle Strukturierung, Preisgestaltung, Organisation und operative Routinen für nachhaltiges Wachstum.',
    },
    challenges: {
      en: [
        'Turnover grows but margin does not.',
        'The offer is unclear to prospects and impossible to price.',
        'Everything depends on the founder.',
        'The company is not ready for external financing.',
      ],
      fr: [
        "Le chiffre d'affaires progresse mais pas la marge.",
        "L'offre est illisible pour les prospects et impossible à tarifer.",
        'Tout dépend du fondateur.',
        "L'entreprise n'est pas prête pour un financement externe.",
      ],
      de: [
        'Der Umsatz wächst, die Marge nicht.',
        'Das Angebot ist für Interessenten unklar und nicht kalkulierbar.',
        'Alles hängt am Gründer.',
        'Das Unternehmen ist nicht bereit für externe Finanzierung.',
      ],
    },
    services: {
      en: [
        {
          title: 'Offer and pricing',
          description: 'Clarifying the offer, structuring pricing and margins.',
        },
        {
          title: 'Commercial structuring',
          description: 'Pipeline, sales routines and follow-up discipline.',
        },
        {
          title: 'Organisation',
          description: 'Roles, delegation and the reporting a manager needs.',
        },
        {
          title: 'Growth roadmap',
          description: 'A sequenced plan with milestones and financing needs.',
        },
      ],
      fr: [
        {
          title: 'Offre et tarification',
          description: "Clarifier l'offre, structurer les prix et les marges.",
        },
        {
          title: 'Structuration commerciale',
          description: 'Pipeline, routines commerciales et discipline de suivi.',
        },
        {
          title: 'Organisation',
          description: 'Rôles, délégation et reporting nécessaire au dirigeant.',
        },
        {
          title: 'Feuille de route de croissance',
          description: 'Un plan séquencé avec jalons et besoins de financement.',
        },
      ],
      de: [
        {
          title: 'Angebot und Preisgestaltung',
          description: 'Angebot schärfen, Preise und Margen strukturieren.',
        },
        {
          title: 'Vertriebsstrukturierung',
          description: 'Pipeline, Vertriebsroutinen und Nachverfolgung.',
        },
        {
          title: 'Organisation',
          description: 'Rollen, Delegation und das Reporting, das eine Führungskraft braucht.',
        },
        {
          title: 'Wachstums-Roadmap',
          description: 'Ein sequenzierter Plan mit Meilensteinen und Finanzierungsbedarf.',
        },
      ],
    },
    audiences: {
      en: [
        'Founders and owner-managers',
        'Family businesses',
        'SME support programmes',
        'Business incubators',
      ],
      fr: [
        'Fondateurs et dirigeants',
        'Entreprises familiales',
        "Programmes d'appui aux PME",
        "Incubateurs d'entreprises",
      ],
      de: ['Gründer und Inhaber', 'Familienunternehmen', 'KMU-Förderprogramme', 'Gründerzentren'],
    },
    approach: {
      en: 'Work on the constraint that actually blocks the business, not on a generic transformation plan. Few priorities, clear owners, short cycles.',
      fr: "Travailler sur la contrainte qui bloque réellement l'entreprise, pas sur un plan de transformation générique. Peu de priorités, des responsables clairs, des cycles courts.",
      de: 'An der Restriktion arbeiten, die das Unternehmen tatsächlich blockiert — nicht an einem generischen Transformationsplan. Wenige Prioritäten, klare Verantwortliche, kurze Zyklen.',
    },
  },
  {
    key: 'project-programme-management',
    icon: 'plan',
    order: 40,
    title: {
      en: 'Project & Programme Management',
      fr: 'Gestion de projet et de programme',
      de: 'Projekt- & Programmmanagement',
    },
    summary: {
      en: 'Bringing structure, governance and reporting to projects that involve several organisations and funders.',
      fr: 'Apporter structure, gouvernance et reporting à des projets impliquant plusieurs organisations et bailleurs.',
      de: 'Struktur, Governance und Reporting für Projekte mit mehreren Organisationen und Geldgebern.',
    },
    intro: {
      en: 'International projects fail on coordination far more often than on technical content. This area covers project set-up, planning, risk management, stakeholder coordination and the reporting expected by funders.',
      fr: 'Les projets internationaux échouent bien plus souvent sur la coordination que sur le contenu technique. Ce domaine couvre le cadrage, la planification, la gestion des risques, la coordination des parties prenantes et le reporting attendu par les bailleurs.',
      de: 'Internationale Projekte scheitern weit häufiger an der Koordination als am fachlichen Inhalt. Dieser Bereich umfasst Projektaufsetzung, Planung, Risikomanagement, Stakeholder-Koordination und das von Gebern erwartete Reporting.',
    },
    challenges: {
      en: [
        'Scope, budget and timeline were never reconciled.',
        'Several partners hold different versions of the plan.',
        'Reporting requirements are discovered late.',
        'Risks are listed but never managed.',
      ],
      fr: [
        "Le périmètre, le budget et le calendrier n'ont jamais été réconciliés.",
        'Plusieurs partenaires détiennent des versions différentes du plan.',
        'Les exigences de reporting sont découvertes tardivement.',
        'Les risques sont listés mais jamais pilotés.',
      ],
      de: [
        'Umfang, Budget und Zeitplan wurden nie in Einklang gebracht.',
        'Mehrere Partner haben unterschiedliche Planversionen.',
        'Reporting-Anforderungen werden spät entdeckt.',
        'Risiken werden aufgelistet, aber nicht gesteuert.',
      ],
    },
    services: {
      en: [
        {
          title: 'Project set-up',
          description: 'Scope, deliverables, governance and decision rules.',
        },
        {
          title: 'Planning & budget',
          description: 'Work breakdown, schedule and budget follow-up.',
        },
        {
          title: 'Stakeholder coordination',
          description: 'Partners, funders and steering committees.',
        },
        {
          title: 'Monitoring & reporting',
          description: 'Indicators and reports that funders can rely on.',
        },
      ],
      fr: [
        {
          title: 'Cadrage de projet',
          description: 'Périmètre, livrables, gouvernance et règles de décision.',
        },
        {
          title: 'Planification et budget',
          description: 'Découpage, calendrier et suivi budgétaire.',
        },
        {
          title: 'Coordination des parties prenantes',
          description: 'Partenaires, bailleurs et comités de pilotage.',
        },
        {
          title: 'Suivi et reporting',
          description: 'Indicateurs et rapports fiables pour les bailleurs.',
        },
      ],
      de: [
        {
          title: 'Projektaufsetzung',
          description: 'Umfang, Ergebnisse, Governance und Entscheidungsregeln.',
        },
        {
          title: 'Planung und Budget',
          description: 'Arbeitsstruktur, Terminplan und Budgetverfolgung.',
        },
        {
          title: 'Stakeholder-Koordination',
          description: 'Partner, Geber und Lenkungsausschüsse.',
        },
        {
          title: 'Monitoring und Reporting',
          description: 'Indikatoren und Berichte, auf die sich Geber verlassen können.',
        },
      ],
    },
    audiences: {
      en: [
        'International organisations',
        'NGOs and funders',
        'Public institutions',
        'Companies running multi-partner projects',
      ],
      fr: [
        'Organisations internationales',
        'ONG et bailleurs',
        'Institutions publiques',
        'Entreprises pilotant des projets multipartenaires',
      ],
      de: [
        'Internationale Organisationen',
        'NGOs und Geber',
        'Öffentliche Institutionen',
        'Unternehmen mit Mehrpartnerprojekten',
      ],
    },
    approach: {
      en: 'One shared plan, one set of indicators, one calendar of decisions. Governance that people actually use rather than a document nobody opens.',
      fr: "Un seul plan partagé, un seul jeu d'indicateurs, un seul calendrier de décisions. Une gouvernance réellement utilisée plutôt qu'un document que personne n'ouvre.",
      de: 'Ein gemeinsamer Plan, ein Satz Indikatoren, ein Entscheidungskalender. Governance, die genutzt wird — statt eines Dokuments, das niemand öffnet.',
    },
  },
  {
    key: 'entrepreneurship-investment-readiness',
    icon: 'spark',
    order: 50,
    title: {
      en: 'Entrepreneurship & Investment Readiness',
      fr: "Entrepreneuriat et préparation à l'investissement",
      de: 'Unternehmertum & Investitionsreife',
    },
    summary: {
      en: 'Preparing founders and their companies to withstand the scrutiny of an investor or a lender.',
      fr: "Préparer les fondateurs et leurs entreprises à soutenir l'examen d'un investisseur ou d'un prêteur.",
      de: 'Gründer und ihre Unternehmen auf die Prüfung durch Investoren oder Kreditgeber vorbereiten.',
    },
    intro: {
      en: 'Investment readiness is a state, not a document: coherent figures, a defensible plan, a clean legal and financial structure, and a founder able to answer hard questions. This area prepares that state.',
      fr: "La préparation à l'investissement est un état, pas un document : des chiffres cohérents, un plan défendable, une structure juridique et financière saine, et un fondateur capable de répondre aux questions difficiles. Ce domaine construit cet état.",
      de: 'Investitionsreife ist ein Zustand, kein Dokument: konsistente Zahlen, ein belastbarer Plan, eine saubere rechtliche und finanzielle Struktur und ein Gründer, der schwierige Fragen beantworten kann. Dieser Bereich schafft diesen Zustand.',
    },
    challenges: {
      en: [
        'The business plan and the accounts tell two different stories.',
        'The funding request has no clear use of proceeds.',
        'Valuation expectations cannot be justified.',
        'Investor questions are answered improvisation by improvisation.',
      ],
      fr: [
        'Le business plan et la comptabilité racontent deux histoires différentes.',
        "La demande de financement n'indique pas clairement l'utilisation des fonds.",
        'Les attentes de valorisation ne sont pas justifiables.',
        'Les questions des investisseurs sont traitées au fil de l’improvisation.',
      ],
      de: [
        'Businessplan und Buchhaltung erzählen zwei verschiedene Geschichten.',
        'Die Finanzierungsanfrage nennt keine klare Mittelverwendung.',
        'Bewertungserwartungen sind nicht begründbar.',
        'Investorenfragen werden improvisiert beantwortet.',
      ],
    },
    services: {
      en: [
        {
          title: 'Investment readiness review',
          description: 'Gap analysis against what investors actually check.',
        },
        {
          title: 'Business plan & model',
          description: 'A plan consistent with the accounts and the market.',
        },
        {
          title: 'Fundraising preparation',
          description: 'Use of proceeds, data room and Q&A preparation.',
        },
        {
          title: 'Founder coaching',
          description: 'Preparing the conversation with investors and lenders.',
        },
      ],
      fr: [
        {
          title: "Diagnostic de préparation à l'investissement",
          description: 'Analyse des écarts avec ce que les investisseurs vérifient réellement.',
        },
        {
          title: 'Business plan et modèle',
          description: 'Un plan cohérent avec la comptabilité et le marché.',
        },
        {
          title: 'Préparation à la levée',
          description: 'Utilisation des fonds, data room et préparation des questions.',
        },
        {
          title: 'Accompagnement du fondateur',
          description: "Préparer l'échange avec les investisseurs et les prêteurs.",
        },
      ],
      de: [
        {
          title: 'Investitionsreife-Check',
          description: 'Lückenanalyse gegenüber dem, was Investoren tatsächlich prüfen.',
        },
        {
          title: 'Businessplan und Modell',
          description: 'Ein Plan im Einklang mit Buchhaltung und Markt.',
        },
        {
          title: 'Fundraising-Vorbereitung',
          description: 'Mittelverwendung, Datenraum und Q&A-Vorbereitung.',
        },
        {
          title: 'Gründer-Coaching',
          description: 'Vorbereitung des Gesprächs mit Investoren und Kreditgebern.',
        },
      ],
    },
    audiences: {
      en: [
        'Founders raising capital',
        'Accelerators',
        'Investment-readiness programmes',
        'Business angels',
      ],
      fr: [
        'Fondateurs en levée de fonds',
        'Accélérateurs',
        "Programmes de préparation à l'investissement",
        'Business angels',
      ],
      de: [
        'Gründer in der Kapitalaufnahme',
        'Acceleratoren',
        'Investitionsreife-Programme',
        'Business Angels',
      ],
    },
    approach: {
      en: 'Prepare the company, not the pitch deck. A file that survives due diligence is worth more than a persuasive presentation.',
      fr: "Préparer l'entreprise, pas le pitch deck. Un dossier qui résiste à la due diligence vaut mieux qu'une présentation persuasive.",
      de: 'Das Unternehmen vorbereiten, nicht das Pitch Deck. Eine Unterlage, die der Due Diligence standhält, ist mehr wert als eine überzeugende Präsentation.',
    },
  },
  {
    key: 'financial-planning-education',
    icon: 'coins',
    order: 60,
    title: {
      en: 'Financial Planning & Education',
      fr: 'Planification financière et éducation financière',
      de: 'Finanzplanung & Finanzbildung',
    },
    summary: {
      en: 'Making money understandable — for individuals, teams and communities — so decisions stop being guesswork.',
      fr: "Rendre l'argent compréhensible — pour des particuliers, des équipes et des communautés — afin que les décisions cessent d'être des paris.",
      de: 'Geld verständlich machen — für Einzelpersonen, Teams und Gemeinschaften —, damit Entscheidungen kein Ratespiel bleiben.',
    },
    intro: {
      en: 'Financial education is the foundation of the brand signature: understand money, build businesses, invest, create wealth. This area covers personal and household financial planning, budgeting methods and the transfer of financial literacy to groups.',
      fr: "L'éducation financière est le socle de la signature de marque : comprendre l'argent, construire des entreprises, investir, créer de la richesse. Ce domaine couvre la planification financière personnelle et familiale, les méthodes budgétaires et la transmission des compétences financières à des groupes.",
      de: 'Finanzbildung ist das Fundament der Markensignatur: Geld verstehen, Unternehmen aufbauen, investieren, Vermögen schaffen. Dieser Bereich umfasst persönliche und familiäre Finanzplanung, Budgetmethoden und die Vermittlung von Finanzkompetenz an Gruppen.',
    },
    challenges: {
      en: [
        'Income rises but nothing is built with it.',
        'Debt is used without a repayment strategy.',
        'Savings have no defined purpose or horizon.',
        'Financial vocabulary itself is a barrier.',
      ],
      fr: [
        'Les revenus augmentent mais rien ne se construit avec.',
        "L'endettement est utilisé sans stratégie de remboursement.",
        "L'épargne n'a ni objectif ni horizon défini.",
        'Le vocabulaire financier constitue lui-même un obstacle.',
      ],
      de: [
        'Das Einkommen steigt, aber es wird nichts daraus aufgebaut.',
        'Schulden werden ohne Rückzahlungsstrategie genutzt.',
        'Ersparnisse haben weder Ziel noch Horizont.',
        'Die Finanzsprache selbst ist eine Hürde.',
      ],
    },
    services: {
      en: [
        {
          title: 'Financial planning',
          description: 'Budget, savings capacity, debt and objectives.',
        },
        {
          title: 'Financial literacy workshops',
          description: 'Sessions adapted to the audience and its context.',
        },
        {
          title: 'Educational content',
          description: 'Articles, guides and material for teams and communities.',
        },
        {
          title: 'Employee financial wellbeing',
          description: 'Programmes for organisations supporting their staff.',
        },
      ],
      fr: [
        {
          title: 'Planification financière',
          description: "Budget, capacité d'épargne, endettement et objectifs.",
        },
        {
          title: "Ateliers d'éducation financière",
          description: 'Sessions adaptées au public et à son contexte.',
        },
        {
          title: 'Contenus pédagogiques',
          description: 'Articles, guides et supports pour équipes et communautés.',
        },
        {
          title: 'Bien-être financier des salariés',
          description: 'Programmes pour les organisations qui accompagnent leurs équipes.',
        },
      ],
      de: [
        { title: 'Finanzplanung', description: 'Budget, Sparfähigkeit, Verschuldung und Ziele.' },
        {
          title: 'Finanzbildungs-Workshops',
          description: 'Sitzungen, angepasst an Zielgruppe und Kontext.',
        },
        {
          title: 'Bildungsinhalte',
          description: 'Artikel, Leitfäden und Material für Teams und Gemeinschaften.',
        },
        {
          title: 'Finanzielles Wohlbefinden von Mitarbeitenden',
          description: 'Programme für Organisationen, die ihre Teams unterstützen.',
        },
      ],
    },
    audiences: {
      en: ['Individuals and families', 'Employers', 'Community organisations', 'Diaspora networks'],
      fr: [
        'Particuliers et familles',
        'Employeurs',
        'Organisations communautaires',
        'Réseaux de la diaspora',
      ],
      de: [
        'Privatpersonen und Familien',
        'Arbeitgeber',
        'Gemeinschaftsorganisationen',
        'Diaspora-Netzwerke',
      ],
    },
    approach: {
      en: 'No jargon, no product selling. Concepts explained with the numbers of the person in front of me.',
      fr: 'Pas de jargon, pas de vente de produits. Des concepts expliqués avec les chiffres de la personne en face de moi.',
      de: 'Kein Fachjargon, kein Produktverkauf. Konzepte erklärt anhand der Zahlen der Person gegenüber.',
    },
  },
  {
    key: 'real-estate-property-financing',
    icon: 'building',
    order: 70,
    title: {
      en: 'Real Estate & Property Financing',
      fr: 'Immobilier et financement immobilier',
      de: 'Immobilien & Immobilienfinanzierung',
    },
    summary: {
      en: 'Assessing property projects as investments: yield, financing structure, risk and exit.',
      fr: 'Évaluer les projets immobiliers comme des investissements : rendement, structure de financement, risque et sortie.',
      de: 'Immobilienprojekte als Investment bewerten: Rendite, Finanzierungsstruktur, Risiko und Exit.',
    },
    intro: {
      en: 'A property is a financial asset with a physical form. This area covers investment analysis, financing structure, the preparation of bank files and the coordination between buyer, bank and intermediaries.',
      fr: "Un bien immobilier est un actif financier sous forme physique. Ce domaine couvre l'analyse d'investissement, la structure de financement, la préparation des dossiers bancaires et la coordination entre acquéreur, banque et intermédiaires.",
      de: 'Eine Immobilie ist ein finanzieller Vermögenswert in physischer Form. Dieser Bereich umfasst Investitionsanalyse, Finanzierungsstruktur, die Vorbereitung von Bankunterlagen und die Koordination zwischen Käufer, Bank und Vermittlern.',
    },
    challenges: {
      en: [
        'Yield is calculated before costs, taxes and vacancy.',
        'The financing structure does not match the holding horizon.',
        'The bank file is incomplete and slows the transaction.',
        'Cross-border projects raise questions nobody has answered.',
      ],
      fr: [
        'Le rendement est calculé avant charges, fiscalité et vacance.',
        "La structure de financement ne correspond pas à l'horizon de détention.",
        'Le dossier bancaire est incomplet et ralentit la transaction.',
        'Les projets transfrontaliers soulèvent des questions restées sans réponse.',
      ],
      de: [
        'Die Rendite wird vor Kosten, Steuern und Leerstand gerechnet.',
        'Die Finanzierungsstruktur passt nicht zum Haltehorizont.',
        'Die Bankunterlagen sind unvollständig und verzögern die Transaktion.',
        'Grenzüberschreitende Projekte werfen unbeantwortete Fragen auf.',
      ],
    },
    services: {
      en: [
        {
          title: 'Investment analysis',
          description: 'Net yield, cash flow, sensitivity and exit scenarios.',
        },
        {
          title: 'Financing structure',
          description: 'Equity, debt, amortisation and holding horizon.',
        },
        {
          title: 'Bank file preparation',
          description: 'Documentation and coordination with the lender.',
        },
        {
          title: 'Project coordination',
          description: 'Alignment between buyer, bank and intermediaries.',
        },
      ],
      fr: [
        {
          title: "Analyse d'investissement",
          description: 'Rendement net, flux de trésorerie, sensibilité et scénarios de sortie.',
        },
        {
          title: 'Structure de financement',
          description: 'Apport, dette, amortissement et horizon de détention.',
        },
        {
          title: 'Préparation du dossier bancaire',
          description: 'Documentation et coordination avec le prêteur.',
        },
        {
          title: 'Coordination de projet',
          description: 'Alignement entre acquéreur, banque et intermédiaires.',
        },
      ],
      de: [
        {
          title: 'Investitionsanalyse',
          description: 'Nettorendite, Cashflow, Sensitivität und Exit-Szenarien.',
        },
        {
          title: 'Finanzierungsstruktur',
          description: 'Eigenkapital, Fremdkapital, Tilgung und Haltehorizont.',
        },
        {
          title: 'Vorbereitung der Bankunterlagen',
          description: 'Dokumentation und Koordination mit dem Kreditgeber.',
        },
        {
          title: 'Projektkoordination',
          description: 'Abstimmung zwischen Käufer, Bank und Vermittlern.',
        },
      ],
    },
    audiences: {
      en: [
        'Private investors',
        'Property buyers',
        'SMEs financing their premises',
        'Diaspora investors',
      ],
      fr: [
        'Investisseurs privés',
        'Acquéreurs immobiliers',
        'PME finançant leurs locaux',
        'Investisseurs de la diaspora',
      ],
      de: [
        'Privatinvestoren',
        'Immobilienkäufer',
        'KMU bei der Objektfinanzierung',
        'Diaspora-Investoren',
      ],
    },
    approach: {
      en: 'Decide with a complete calculation, including the costs people prefer to forget, before falling in love with a property.',
      fr: "Décider avec un calcul complet, y compris les coûts qu'on préfère oublier, avant de s'attacher à un bien.",
      de: 'Mit einer vollständigen Rechnung entscheiden — inklusive der gern vergessenen Kosten — bevor man sich in eine Immobilie verliebt.',
    },
  },
  {
    key: 'training-mentoring',
    icon: 'people',
    order: 80,
    title: {
      en: 'Training, Mentoring & Capacity Building',
      fr: 'Formation, mentorat et renforcement de capacités',
      de: 'Training, Mentoring & Kompetenzaufbau',
    },
    summary: {
      en: 'Transferring financial and managerial competence so teams keep performing after the assignment ends.',
      fr: 'Transférer des compétences financières et managériales pour que les équipes restent performantes après la mission.',
      de: 'Finanz- und Managementkompetenz übertragen, damit Teams auch nach dem Mandat leistungsfähig bleiben.',
    },
    intro: {
      en: 'Advice that cannot be repeated by the team is a dependency. This area covers training design, delivery in three languages, mentoring of founders and managers, and capacity building inside institutions.',
      fr: "Un conseil que l'équipe ne peut pas reproduire crée une dépendance. Ce domaine couvre la conception de formations, leur animation en trois langues, le mentorat de fondateurs et de managers, et le renforcement de capacités au sein des institutions.",
      de: 'Beratung, die das Team nicht wiederholen kann, erzeugt Abhängigkeit. Dieser Bereich umfasst Trainingskonzeption, Durchführung in drei Sprachen, Mentoring von Gründern und Führungskräften sowie Kompetenzaufbau in Institutionen.',
    },
    challenges: {
      en: [
        'Knowledge leaves with the consultant.',
        'Training is generic and disconnected from real files.',
        'Managers have never been taught to read their own reporting.',
        'Teams work in several languages and materials exist in one.',
      ],
      fr: [
        'Le savoir repart avec le consultant.',
        'Les formations sont génériques et déconnectées des dossiers réels.',
        "Les managers n'ont jamais appris à lire leur propre reporting.",
        'Les équipes travaillent en plusieurs langues et les supports existent dans une seule.',
      ],
      de: [
        'Das Wissen geht mit dem Berater.',
        'Trainings sind generisch und ohne Bezug zu echten Fällen.',
        'Führungskräfte haben nie gelernt, ihr eigenes Reporting zu lesen.',
        'Teams arbeiten mehrsprachig, Materialien existieren nur in einer Sprache.',
      ],
    },
    services: {
      en: [
        {
          title: 'Training design',
          description: 'Programmes built on the organisation’s real cases.',
        },
        {
          title: 'Delivery',
          description: 'Workshops in French, English or German, on site or remote.',
        },
        { title: 'Mentoring', description: 'Individual support for founders and managers.' },
        {
          title: 'Capacity building',
          description: 'Tools, templates and routines the team keeps.',
        },
      ],
      fr: [
        {
          title: 'Conception de formation',
          description: "Programmes construits sur les cas réels de l'organisation.",
        },
        {
          title: 'Animation',
          description: 'Ateliers en français, anglais ou allemand, sur site ou à distance.',
        },
        {
          title: 'Mentorat',
          description: 'Accompagnement individuel de fondateurs et de managers.',
        },
        {
          title: 'Renforcement de capacités',
          description: "Outils, modèles et routines conservés par l'équipe.",
        },
      ],
      de: [
        {
          title: 'Trainingskonzeption',
          description: 'Programme auf Basis realer Fälle der Organisation.',
        },
        {
          title: 'Durchführung',
          description: 'Workshops auf Französisch, Englisch oder Deutsch, vor Ort oder remote.',
        },
        {
          title: 'Mentoring',
          description: 'Individuelle Begleitung von Gründern und Führungskräften.',
        },
        {
          title: 'Kompetenzaufbau',
          description: 'Werkzeuge, Vorlagen und Routinen, die beim Team bleiben.',
        },
      ],
    },
    audiences: {
      en: [
        'Institutions and programmes',
        'Company teams',
        'Founders and managers',
        'Business schools and networks',
      ],
      fr: [
        'Institutions et programmes',
        "Équipes d'entreprise",
        'Fondateurs et managers',
        'Écoles de commerce et réseaux',
      ],
      de: [
        'Institutionen und Programme',
        'Unternehmensteams',
        'Gründer und Führungskräfte',
        'Business Schools und Netzwerke',
      ],
    },
    approach: {
      en: 'Teach with the organisation’s own files. If the team cannot reproduce the exercise alone the next week, the training has not worked.',
      fr: "Enseigner à partir des dossiers de l'organisation. Si l'équipe ne peut pas refaire l'exercice seule la semaine suivante, la formation a échoué.",
      de: 'Mit den eigenen Unterlagen der Organisation arbeiten. Kann das Team die Übung in der Folgewoche nicht allein wiederholen, hat das Training nicht funktioniert.',
    },
  },
]

export const starterCategories: { key: string; title: Localized }[] = [
  { key: 'finance', title: { en: 'Finance', fr: 'Finance', de: 'Finanzen' } },
  {
    key: 'financial-education',
    title: { en: 'Financial Education', fr: 'Éducation financière', de: 'Finanzbildung' },
  },
  {
    key: 'due-diligence',
    title: { en: 'Due Diligence', fr: 'Due diligence', de: 'Due Diligence' },
  },
  { key: 'business', title: { en: 'Business', fr: 'Business', de: 'Business' } },
  {
    key: 'entrepreneurship',
    title: { en: 'Entrepreneurship', fr: 'Entrepreneuriat', de: 'Unternehmertum' },
  },
  { key: 'investment', title: { en: 'Investment', fr: 'Investissement', de: 'Investment' } },
  { key: 'real-estate', title: { en: 'Real Estate', fr: 'Immobilier', de: 'Immobilien' } },
  {
    key: 'project-management',
    title: { en: 'Project Management', fr: 'Gestion de projet', de: 'Projektmanagement' },
  },
  { key: 'leadership', title: { en: 'Leadership', fr: 'Leadership', de: 'Leadership' } },
]

export type StarterBusiness = {
  key: string
  name: string
  order: number
  tagline: Localized
  description: Localized
  valueProposition: Localized
  field: Localized
  audience: Localized
  website: string
}

export const starterBusinesses: StarterBusiness[] = [
  {
    key: 'rk-business-consulting',
    name: 'RK Business Consulting',
    order: 10,
    tagline: {
      en: 'Advisory for businesses and investors',
      fr: 'Conseil aux entreprises et aux investisseurs',
      de: 'Beratung für Unternehmen und Investoren',
    },
    description: {
      en: '[Description to be provided by the owner.] The consulting practice through which advisory assignments in corporate finance, due diligence and business development are delivered.',
      fr: '[Description à fournir par le propriétaire.] La structure de conseil à travers laquelle sont réalisées les missions en corporate finance, due diligence et business development.',
      de: '[Beschreibung durch den Inhaber zu liefern.] Die Beratungspraxis, über die Mandate in Corporate Finance, Due Diligence und Business Development umgesetzt werden.',
    },
    valueProposition: {
      en: '[Value proposition to be confirmed.]',
      fr: '[Proposition de valeur à confirmer.]',
      de: '[Nutzenversprechen zu bestätigen.]',
    },
    field: {
      en: 'Business & financial advisory',
      fr: 'Conseil business et finance',
      de: 'Business- und Finanzberatung',
    },
    audience: {
      en: 'SMEs, investors, institutions',
      fr: 'PME, investisseurs, institutions',
      de: 'KMU, Investoren, Institutionen',
    },
    website: '',
  },
  {
    key: 'rk-immo-finanz',
    name: 'RK IMMO-FINANZ',
    order: 20,
    tagline: {
      en: 'Real estate and property financing',
      fr: 'Immobilier et financement immobilier',
      de: 'Immobilien und Immobilienfinanzierung',
    },
    description: {
      en: '[Description to be provided by the owner.] Activity dedicated to property projects and their financing.',
      fr: '[Description à fournir par le propriétaire.] Activité dédiée aux projets immobiliers et à leur financement.',
      de: '[Beschreibung durch den Inhaber zu liefern.] Aktivität rund um Immobilienprojekte und deren Finanzierung.',
    },
    valueProposition: {
      en: '[Value proposition to be confirmed.]',
      fr: '[Proposition de valeur à confirmer.]',
      de: '[Nutzenversprechen zu bestätigen.]',
    },
    field: {
      en: 'Real estate financing',
      fr: 'Financement immobilier',
      de: 'Immobilienfinanzierung',
    },
    audience: {
      en: 'Property buyers and investors',
      fr: 'Acquéreurs et investisseurs immobiliers',
      de: 'Immobilienkäufer und Investoren',
    },
    website: '',
  },
  {
    key: 'kaili-institut',
    name: 'KAILI Institut',
    order: 30,
    tagline: {
      en: 'Training and capacity building',
      fr: 'Formation et renforcement de capacités',
      de: 'Weiterbildung und Kompetenzaufbau',
    },
    description: {
      en: '[Description to be provided by the owner.] Training activity covering financial education and professional development.',
      fr: "[Description à fournir par le propriétaire.] Activité de formation couvrant l'éducation financière et le développement professionnel.",
      de: '[Beschreibung durch den Inhaber zu liefern.] Bildungsaktivität rund um Finanzbildung und berufliche Entwicklung.',
    },
    valueProposition: {
      en: '[Value proposition to be confirmed.]',
      fr: '[Proposition de valeur à confirmer.]',
      de: '[Nutzenversprechen zu bestätigen.]',
    },
    field: {
      en: 'Training & education',
      fr: 'Formation et éducation',
      de: 'Aus- und Weiterbildung',
    },
    audience: {
      en: 'Individuals, teams, institutions',
      fr: 'Particuliers, équipes, institutions',
      de: 'Privatpersonen, Teams, Institutionen',
    },
    website: '',
  },
  {
    key: 'kaili-event',
    name: 'KAILI Event',
    order: 40,
    tagline: {
      en: 'Events and professional gatherings',
      fr: 'Événements et rencontres professionnelles',
      de: 'Veranstaltungen und Fachtreffen',
    },
    description: {
      en: '[Description to be provided by the owner.] Activity dedicated to the organisation of events.',
      fr: "[Description à fournir par le propriétaire.] Activité dédiée à l'organisation d'événements.",
      de: '[Beschreibung durch den Inhaber zu liefern.] Aktivität rund um die Organisation von Veranstaltungen.',
    },
    valueProposition: {
      en: '[Value proposition to be confirmed.]',
      fr: '[Proposition de valeur à confirmer.]',
      de: '[Nutzenversprechen zu bestätigen.]',
    },
    field: { en: 'Events', fr: 'Événementiel', de: 'Eventmanagement' },
    audience: {
      en: 'Organisations and communities',
      fr: 'Organisations et communautés',
      de: 'Organisationen und Gemeinschaften',
    },
    website: '',
  },
]

/**
 * Structural examples only. Organisations, roles and periods are deliberately
 * written as brackets: no assignment is ever invented.
 */
export type StarterExperience = {
  key: string
  type: 'assignment' | 'project'
  region: 'europe' | 'africa' | 'international'
  organisation: string
  startDate: string
  endDate?: string
  featured: boolean
  order: number
  title: Localized
  role: Localized
  sector: Localized
  summary: Localized
  countries: Localized<string[]>
  responsibilities: Localized<string[]>
}

export const starterExperiences: StarterExperience[] = [
  {
    key: 'europe-assignment-placeholder',
    type: 'assignment',
    region: 'europe',
    organisation: '[Organisation — to be provided]',
    startDate: '2023-01-01',
    featured: true,
    order: 10,
    title: {
      en: '[Assignment title — to be provided]',
      fr: '[Intitulé de la mission — à fournir]',
      de: '[Mandatstitel — anzugeben]',
    },
    role: {
      en: '[Role — to be provided]',
      fr: '[Rôle — à fournir]',
      de: '[Rolle — anzugeben]',
    },
    sector: { en: '[Sector]', fr: '[Secteur]', de: '[Branche]' },
    summary: {
      en: 'Sample entry showing how a European assignment is displayed. Replace it in the CMS with a verified assignment — organisation, role, period, context and responsibilities.',
      fr: "Fiche d'exemple montrant l'affichage d'une mission européenne. Remplacez-la dans le CMS par une mission vérifiée — organisation, rôle, période, contexte et responsabilités.",
      de: 'Beispieleintrag, der die Darstellung eines europäischen Mandats zeigt. Im CMS durch ein geprüftes Mandat ersetzen — Organisation, Rolle, Zeitraum, Kontext und Verantwortlichkeiten.',
    },
    countries: { en: ['[Country]'], fr: ['[Pays]'], de: ['[Land]'] },
    responsibilities: {
      en: ['[Responsibility — to be provided]'],
      fr: ['[Responsabilité — à fournir]'],
      de: ['[Verantwortlichkeit — anzugeben]'],
    },
  },
  {
    key: 'africa-project-placeholder',
    type: 'project',
    region: 'africa',
    organisation: '[Organisation — to be provided]',
    startDate: '2022-01-01',
    endDate: '2023-06-01',
    featured: true,
    order: 20,
    title: {
      en: '[Project title — to be provided]',
      fr: '[Intitulé du projet — à fournir]',
      de: '[Projekttitel — anzugeben]',
    },
    role: { en: '[Role — to be provided]', fr: '[Rôle — à fournir]', de: '[Rolle — anzugeben]' },
    sector: { en: '[Sector]', fr: '[Secteur]', de: '[Branche]' },
    summary: {
      en: 'Sample entry showing how an African project is displayed, including the results block which stays hidden until the results have been verified.',
      fr: "Fiche d'exemple montrant l'affichage d'un projet africain, y compris le bloc résultats qui reste masqué tant que les résultats ne sont pas validés.",
      de: 'Beispieleintrag für die Darstellung eines afrikanischen Projekts, inklusive Ergebnisblock, der bis zur Validierung verborgen bleibt.',
    },
    countries: { en: ['[Country]'], fr: ['[Pays]'], de: ['[Land]'] },
    responsibilities: {
      en: ['[Responsibility — to be provided]'],
      fr: ['[Responsabilité — à fournir]'],
      de: ['[Verantwortlichkeit — anzugeben]'],
    },
  },
  {
    key: 'international-assignment-placeholder',
    type: 'assignment',
    region: 'international',
    organisation: '[Organisation — to be provided]',
    startDate: '2021-01-01',
    endDate: '2022-01-01',
    featured: true,
    order: 30,
    title: {
      en: '[International assignment — to be provided]',
      fr: '[Mission internationale — à fournir]',
      de: '[Internationales Mandat — anzugeben]',
    },
    role: { en: '[Role — to be provided]', fr: '[Rôle — à fournir]', de: '[Rolle — anzugeben]' },
    sector: { en: '[Sector]', fr: '[Secteur]', de: '[Branche]' },
    summary: {
      en: 'Sample entry used to demonstrate the filters by expertise, sector, organisation and region.',
      fr: "Fiche d'exemple servant à démontrer les filtres par expertise, secteur, organisation et région.",
      de: 'Beispieleintrag zur Demonstration der Filter nach Expertise, Branche, Organisation und Region.',
    },
    countries: { en: ['[Country]'], fr: ['[Pays]'], de: ['[Land]'] },
    responsibilities: {
      en: ['[Responsibility — to be provided]'],
      fr: ['[Responsabilité — à fournir]'],
      de: ['[Verantwortlichkeit — anzugeben]'],
    },
  },
]

export type StarterInsight = {
  key: string
  categoryKey: string
  publishedAt: string
  featured: boolean
  readingTime: number
  title: Localized
  excerpt: Localized
  paragraphs: Localized<string[]>
}

export const starterInsights: StarterInsight[] = [
  {
    key: 'reading-a-balance-sheet',
    categoryKey: 'financial-education',
    publishedAt: '2026-08-18T09:00:00.000Z',
    featured: true,
    readingTime: 5,
    title: {
      en: 'Reading a balance sheet without being an accountant',
      fr: 'Lire un bilan sans être comptable',
      de: 'Eine Bilanz lesen, ohne Buchhalter zu sein',
    },
    excerpt: {
      en: 'Three questions are enough to understand what a balance sheet says about a business — and what it deliberately hides.',
      fr: "Trois questions suffisent pour comprendre ce qu'un bilan dit d'une entreprise — et ce qu'il dissimule.",
      de: 'Drei Fragen genügen, um zu verstehen, was eine Bilanz über ein Unternehmen aussagt — und was sie verschweigt.',
    },
    paragraphs: {
      en: [
        'A balance sheet is a photograph taken on a single day. It shows what the business owns, what it owes and what is left for the owners. Everything else is interpretation.',
        'The first question is about structure: how much of what the company owns is financed by other people? A business can be profitable and still be one bank decision away from stopping.',
        'The second question is about liquidity: can the company pay what falls due in the next twelve months with what it will actually collect during the same period? Profit and cash are not the same thing, and the gap between them explains most business failures.',
        'The third question is about quality: what is behind the assets? Receivables that will never be collected and inventory nobody wants are recorded at full value until someone decides otherwise.',
        'Anyone can ask these three questions. Answering them precisely is the work — and that is where an external eye is useful.',
      ],
      fr: [
        "Un bilan est une photographie prise un jour donné. Il montre ce que l'entreprise possède, ce qu'elle doit et ce qui reste aux propriétaires. Tout le reste est interprétation.",
        "La première question porte sur la structure : quelle part de ce que possède l'entreprise est financée par des tiers ? Une entreprise peut être rentable et se trouver à une décision bancaire de l'arrêt.",
        "La deuxième question porte sur la liquidité : l'entreprise peut-elle payer ce qui arrive à échéance dans les douze prochains mois avec ce qu'elle encaissera réellement sur la même période ? Résultat et trésorerie ne sont pas la même chose, et l'écart entre les deux explique la plupart des défaillances.",
        "La troisième question porte sur la qualité : qu'y a-t-il derrière les actifs ? Des créances qui ne seront jamais recouvrées et des stocks dont personne ne veut restent inscrits à leur valeur pleine jusqu'à ce que quelqu'un en décide autrement.",
        "Tout le monde peut poser ces trois questions. Y répondre précisément constitue le travail — et c'est là qu'un regard extérieur est utile.",
      ],
      de: [
        'Eine Bilanz ist eine Momentaufnahme eines einzelnen Tages. Sie zeigt, was das Unternehmen besitzt, was es schuldet und was den Eigentümern bleibt. Alles andere ist Interpretation.',
        'Die erste Frage betrifft die Struktur: Wie viel des Unternehmensvermögens ist von Dritten finanziert? Ein Unternehmen kann profitabel sein und dennoch eine Bankentscheidung vom Stillstand entfernt.',
        'Die zweite Frage betrifft die Liquidität: Kann das Unternehmen die Fälligkeiten der nächsten zwölf Monate mit den tatsächlichen Einzahlungen desselben Zeitraums bedienen? Gewinn und Liquidität sind nicht dasselbe — die Lücke dazwischen erklärt die meisten Insolvenzen.',
        'Die dritte Frage betrifft die Qualität: Was steckt hinter den Aktiva? Forderungen, die nie eingehen, und Bestände, die niemand will, stehen zum vollen Wert in den Büchern, bis jemand anders entscheidet.',
        'Diese drei Fragen kann jeder stellen. Sie präzise zu beantworten ist die Arbeit — und genau dort hilft ein externer Blick.',
      ],
    },
  },
  {
    key: 'due-diligence-before-you-buy',
    categoryKey: 'due-diligence',
    publishedAt: '2026-08-04T09:00:00.000Z',
    featured: false,
    readingTime: 4,
    title: {
      en: 'What due diligence actually checks before you buy a company',
      fr: "Ce que vérifie réellement une due diligence avant l'achat d'une entreprise",
      de: 'Was eine Due Diligence vor dem Unternehmenskauf tatsächlich prüft',
    },
    excerpt: {
      en: 'Due diligence is not an audit. It answers a different question: is the price justified by what the business really earns?',
      fr: "La due diligence n'est pas un audit. Elle répond à une autre question : le prix est-il justifié par ce que l'entreprise gagne réellement ?",
      de: 'Due Diligence ist kein Audit. Sie beantwortet eine andere Frage: Rechtfertigt das, was das Unternehmen wirklich verdient, den Preis?',
    },
    paragraphs: {
      en: [
        'An audit certifies that accounts comply with a framework. Due diligence asks whether the earnings presented will still exist next year, under a new owner, without the seller.',
        'The core of the work is normalisation: removing what happened only once, adding what the seller stopped paying, restating what a buyer will have to pay again.',
        'The second axis is cash. A business with strong profit and permanently negative operating cash flow is either growing very fast or converting nothing into money.',
        'The third axis is dependency: one client, one supplier, one person. A concentration that the seller calls a strength is usually the buyer’s main risk.',
        'A good due diligence report is short. It says what changes the price, what changes the contract, and what should stop the transaction.',
      ],
      fr: [
        "Un audit certifie la conformité des comptes à un référentiel. La due diligence demande si les résultats présentés existeront encore l'année prochaine, sous un nouveau propriétaire, sans le vendeur.",
        "Le cœur du travail est la normalisation : retirer ce qui ne s'est produit qu'une fois, ajouter ce que le vendeur a cessé de payer, retraiter ce que l'acquéreur devra payer de nouveau.",
        "Le deuxième axe est la trésorerie. Une entreprise très rentable dont les flux d'exploitation restent négatifs croît très vite ou ne convertit rien en argent.",
        "Le troisième axe est la dépendance : un client, un fournisseur, une personne. La concentration que le vendeur présente comme une force est en général le principal risque de l'acquéreur.",
        'Un bon rapport de due diligence est court. Il dit ce qui change le prix, ce qui change le contrat, et ce qui doit arrêter la transaction.',
      ],
      de: [
        'Ein Audit bestätigt die Konformität der Abschlüsse mit einem Regelwerk. Die Due Diligence fragt, ob die ausgewiesenen Ergebnisse auch im nächsten Jahr bestehen — unter neuem Eigentümer, ohne den Verkäufer.',
        'Kern der Arbeit ist die Normalisierung: Einmaliges herausnehmen, Weggelassenes ergänzen, das anpassen, was ein Käufer erneut zahlen muss.',
        'Die zweite Achse ist die Liquidität. Ein Unternehmen mit hoher Marge und dauerhaft negativem operativem Cashflow wächst entweder sehr schnell oder wandelt nichts in Geld um.',
        'Die dritte Achse ist Abhängigkeit: ein Kunde, ein Lieferant, eine Person. Die Konzentration, die der Verkäufer als Stärke darstellt, ist meist das Hauptrisiko des Käufers.',
        'Ein guter Due-Diligence-Bericht ist kurz. Er benennt, was den Preis verändert, was den Vertrag verändert und was die Transaktion stoppen sollte.',
      ],
    },
  },
  {
    key: 'sme-growth-without-margin',
    categoryKey: 'entrepreneurship',
    publishedAt: '2026-07-21T09:00:00.000Z',
    featured: false,
    readingTime: 4,
    title: {
      en: 'Growing turnover without growing margin: the most common SME trap',
      fr: "Croître en chiffre d'affaires sans croître en marge : le piège le plus fréquent des PME",
      de: 'Umsatzwachstum ohne Margenwachstum: die häufigste KMU-Falle',
    },
    excerpt: {
      en: 'When revenue rises and cash gets tighter, the problem is almost never sales. It is pricing, structure and discipline.',
      fr: "Quand le chiffre d'affaires monte et que la trésorerie se tend, le problème vient rarement des ventes. Il vient du prix, de la structure et de la discipline.",
      de: 'Wenn der Umsatz steigt und die Liquidität enger wird, liegt es fast nie am Vertrieb — sondern an Preis, Struktur und Disziplin.',
    },
    paragraphs: {
      en: [
        'Growth consumes cash. Every additional order is paid for before it is invoiced, and often long before it is collected.',
        'The first thing to check is not the sales pipeline but the price list: are indirect costs, unbilled hours and rework included in the price of the service?',
        'The second is the client mix. Growth built on the least profitable segment mechanically dilutes the margin — the company works more for the same result.',
        'The third is the collection cycle. A business that grows twenty per cent with a payment delay of ninety days finances its own clients.',
        'The correction is rarely dramatic: reprice, choose the segment, tighten collection. In that order.',
      ],
      fr: [
        "La croissance consomme de la trésorerie. Chaque commande supplémentaire est payée avant d'être facturée, et souvent bien avant d'être encaissée.",
        "La première chose à vérifier n'est pas le pipeline commercial mais la grille tarifaire : les coûts indirects, les heures non facturées et les reprises sont-ils inclus dans le prix de la prestation ?",
        "La deuxième est la composition du portefeuille clients. Une croissance portée par le segment le moins rentable dilue mécaniquement la marge — l'entreprise travaille davantage pour le même résultat.",
        "La troisième est le cycle d'encaissement. Une entreprise qui croît de vingt pour cent avec quatre-vingt-dix jours de délai de paiement finance ses propres clients.",
        'La correction est rarement spectaculaire : retarifer, choisir le segment, resserrer le recouvrement. Dans cet ordre.',
      ],
      de: [
        'Wachstum verbraucht Liquidität. Jeder zusätzliche Auftrag wird bezahlt, bevor er fakturiert ist — und oft lange bevor er eingeht.',
        'Zuerst zu prüfen ist nicht die Vertriebspipeline, sondern die Preisliste: Sind Gemeinkosten, nicht fakturierte Stunden und Nacharbeit im Leistungspreis enthalten?',
        'Zweitens der Kundenmix. Wachstum im unrentabelsten Segment verwässert die Marge mechanisch — das Unternehmen arbeitet mehr für dasselbe Ergebnis.',
        'Drittens der Zahlungszyklus. Ein Unternehmen, das um zwanzig Prozent wächst und neunzig Tage Zahlungsziel gewährt, finanziert seine eigenen Kunden.',
        'Die Korrektur ist selten spektakulär: neu bepreisen, Segment wählen, Forderungsmanagement straffen. In dieser Reihenfolge.',
      ],
    },
  },
]

export type StarterBook = {
  key: string
  order: number
  availability: 'available' | 'preorder' | 'comingSoon' | 'outOfStock'
  saleType: 'external' | 'direct' | 'none'
  title: Localized
  subtitle: Localized
  summary: Localized
  audience: Localized<string[]>
}

export const starterBooks: StarterBook[] = [
  {
    key: 'understand-money',
    order: 10,
    availability: 'comingSoon',
    saleType: 'none',
    title: {
      en: '[Book title — to be provided]',
      fr: '[Titre du livre — à fournir]',
      de: '[Buchtitel — anzugeben]',
    },
    subtitle: {
      en: '[Subtitle — to be provided]',
      fr: '[Sous-titre — à fournir]',
      de: '[Untertitel — anzugeben]',
    },
    summary: {
      en: 'Sample entry showing how a publication is presented: cover, summary, audience, format, ISBN, price and purchase link. Replace it with the real publication data in the CMS. No payment flow is activated on this website.',
      fr: "Fiche d'exemple montrant la présentation d'une publication : couverture, résumé, public, format, ISBN, prix et lien d'achat. Remplacez-la par les données réelles dans le CMS. Aucun flux de paiement n'est activé sur ce site.",
      de: 'Beispieleintrag für die Darstellung einer Publikation: Cover, Zusammenfassung, Zielgruppe, Format, ISBN, Preis und Kauflink. Im CMS durch die echten Daten ersetzen. Auf dieser Website ist kein Zahlungsprozess aktiviert.',
    },
    audience: {
      en: ['[Target audience — to be provided]'],
      fr: ['[Public cible — à fournir]'],
      de: ['[Zielgruppe — anzugeben]'],
    },
  },
]

export type StarterCredential = {
  key: string
  kind: 'education' | 'credential'
  institution: string
  year: string
  order: number
  title: Localized
}

export const starterCredentials: StarterCredential[] = [
  {
    key: 'education-placeholder',
    kind: 'education',
    institution: '[Institution — to be provided]',
    year: '[Year]',
    order: 10,
    title: {
      en: '[Diploma — to be provided]',
      fr: '[Diplôme — à fournir]',
      de: '[Abschluss — anzugeben]',
    },
  },
  {
    key: 'credential-placeholder',
    kind: 'credential',
    institution: '[Issuing body — to be provided]',
    year: '[Year]',
    order: 20,
    title: {
      en: '[Professional credential — to be provided]',
      fr: '[Qualification professionnelle — à fournir]',
      de: '[Berufliche Qualifikation — anzugeben]',
    },
  },
]

export const starterAbout = {
  lead: {
    en: 'Business and financial consultant, project manager and entrepreneur working between Europe and Africa.',
    fr: "Consultant en business et finance, chef de projet et entrepreneur, entre l'Europe et l'Afrique.",
    de: 'Business- und Finanzberater, Projektmanager und Unternehmer zwischen Europa und Afrika.',
  } satisfies Localized,
  biography: {
    en: '[Executive biography to be provided and validated by the owner.] This section presents the professional profile: positioning, main areas of intervention and the type of organisations supported. It must be written by — or validated with — Romial Kenmogne before publication.',
    fr: "[Biographie exécutive à fournir et à valider par le propriétaire.] Cette section présente le profil professionnel : positionnement, principaux domaines d'intervention et types d'organisations accompagnées. Elle doit être rédigée par — ou validée avec — Romial Kenmogne avant publication.",
    de: '[Executive Biografie durch den Inhaber zu liefern und freizugeben.] Dieser Abschnitt stellt das berufliche Profil dar: Positionierung, zentrale Tätigkeitsfelder und Art der begleiteten Organisationen. Vor Veröffentlichung von Romial Kenmogne zu verfassen oder freizugeben.',
  } satisfies Localized,
  career: {
    en: '[Career path to be provided.] A synthetic timeline of the professional path, in Europe and in Africa.',
    fr: '[Parcours professionnel à fournir.] Une chronologie synthétique du parcours, en Europe et en Afrique.',
    de: '[Beruflicher Werdegang anzugeben.] Eine kompakte Chronologie des Werdegangs in Europa und Afrika.',
  } satisfies Localized,
  vision: {
    en: 'The Europe–Africa vision underlying this practice: capital, competence and governance standards travel in both directions. Businesses on both continents gain from being read with the same financial rigour and supported with the same seriousness.',
    fr: 'La vision Europe–Afrique qui sous-tend cette pratique : les capitaux, les compétences et les standards de gouvernance circulent dans les deux sens. Les entreprises des deux continents gagnent à être lues avec la même rigueur financière et accompagnées avec le même sérieux.',
    de: 'Die Europa–Afrika-Vision hinter dieser Praxis: Kapital, Kompetenz und Governance-Standards bewegen sich in beide Richtungen. Unternehmen auf beiden Kontinenten profitieren davon, mit derselben finanziellen Sorgfalt gelesen und ebenso ernsthaft begleitet zu werden.',
  } satisfies Localized,
  values: {
    en: [
      {
        title: 'Evidence first',
        description: 'No recommendation without figures that can be traced back to a source.',
      },
      {
        title: 'Transfer, not dependency',
        description: 'The client team must be able to continue without me.',
      },
      {
        title: 'Clarity',
        description:
          'If a decision-maker cannot explain the analysis, the analysis is not finished.',
      },
      {
        title: 'Discretion',
        description:
          'Client information stays confidential; no logo or name is published without agreement.',
      },
    ],
    fr: [
      {
        title: "La preuve d'abord",
        description: "Aucune recommandation sans chiffres traçables jusqu'à leur source.",
      },
      {
        title: 'Transmettre, pas rendre dépendant',
        description: "L'équipe du client doit pouvoir continuer sans moi.",
      },
      {
        title: 'Clarté',
        description:
          "Si un décideur ne peut pas expliquer l'analyse, l'analyse n'est pas terminée.",
      },
      {
        title: 'Discrétion',
        description:
          "Les informations des clients restent confidentielles ; aucun logo ni nom n'est publié sans accord.",
      },
    ],
    de: [
      {
        title: 'Belege zuerst',
        description: 'Keine Empfehlung ohne Zahlen, die bis zur Quelle nachvollziehbar sind.',
      },
      {
        title: 'Übertragen statt abhängig machen',
        description: 'Das Team des Kunden muss ohne mich weiterarbeiten können.',
      },
      {
        title: 'Klarheit',
        description:
          'Kann eine Führungskraft die Analyse nicht erklären, ist die Analyse nicht fertig.',
      },
      {
        title: 'Diskretion',
        description:
          'Kundendaten bleiben vertraulich; kein Logo und kein Name wird ohne Zustimmung veröffentlicht.',
      },
    ],
  } satisfies Localized<{ title: string; description: string }[]>,
  languages: [
    {
      language: { en: 'French', fr: 'Français', de: 'Französisch' },
      level: { en: '[Level]', fr: '[Niveau]', de: '[Niveau]' },
    },
    {
      language: { en: 'English', fr: 'Anglais', de: 'Englisch' },
      level: { en: '[Level]', fr: '[Niveau]', de: '[Niveau]' },
    },
    {
      language: { en: 'German', fr: 'Allemand', de: 'Deutsch' },
      level: { en: '[Level]', fr: '[Niveau]', de: '[Niveau]' },
    },
  ],
  regions: [
    { en: 'Europe', fr: 'Europe', de: 'Europa' },
    { en: 'Africa', fr: 'Afrique', de: 'Afrika' },
    { en: 'International', fr: 'International', de: 'International' },
  ] as Localized[],
}

export const starterHome = {
  heroEyebrow: {
    en: 'Europe · Africa · International',
    fr: 'Europe · Afrique · International',
    de: 'Europa · Afrika · International',
  } satisfies Localized,
  heroValueProposition: {
    en: 'I help organisations, SMEs and investors understand their numbers, structure their projects and build businesses that last.',
    fr: "J'aide les organisations, les PME et les investisseurs à comprendre leurs chiffres, structurer leurs projets et bâtir des entreprises durables.",
    de: 'Ich unterstütze Organisationen, KMU und Investoren dabei, ihre Zahlen zu verstehen, Projekte zu strukturieren und tragfähige Unternehmen aufzubauen.',
  } satisfies Localized,
  heroKeyPoints: [
    {
      label: { en: 'Working languages', fr: 'Langues de travail', de: 'Arbeitssprachen' },
      value: {
        en: 'French · English · German',
        fr: 'Français · Anglais · Allemand',
        de: 'Französisch · Englisch · Deutsch',
      },
    },
    {
      label: { en: 'Regions', fr: 'Régions', de: 'Regionen' },
      value: { en: 'Europe · Africa', fr: 'Europe · Afrique', de: 'Europa · Afrika' },
    },
    {
      label: { en: 'Focus', fr: 'Focus', de: 'Fokus' },
      value: {
        en: 'Finance · Due diligence · Projects',
        fr: 'Finance · Due diligence · Projets',
        de: 'Finanzen · Due Diligence · Projekte',
      },
    },
  ],
  finalCtaTitle: {
    en: 'Looking for an international consultant, financial expert or project manager?',
    fr: 'Vous cherchez un consultant international, un expert financier ou un chef de projet ?',
    de: 'Suchen Sie einen internationalen Berater, Finanzexperten oder Projektmanager?',
  } satisfies Localized,
  finalCtaBody: {
    en: 'Tell me about your organisation, your project and your timeline. Every qualified request receives a personal answer.',
    fr: 'Présentez votre organisation, votre projet et votre calendrier. Chaque demande qualifiée reçoit une réponse personnelle.',
    de: 'Beschreiben Sie Ihre Organisation, Ihr Projekt und Ihren Zeitplan. Jede qualifizierte Anfrage erhält eine persönliche Antwort.',
  } satisfies Localized,
}

export type StarterLegalPage = {
  type: 'imprint' | 'privacy' | 'cookies' | 'terms' | 'returns'
  title: Localized
  sections: Localized<{ heading: string; body: string }[]>
}

const legalDraft = (fr: string, en: string, de: string) => ({ en, fr, de })

export const starterLegalPages: StarterLegalPage[] = [
  {
    type: 'imprint',
    title: legalDraft('Impressum / Mentions légales', 'Imprint', 'Impressum'),
    sections: {
      en: [
        {
          heading: 'Publisher',
          body: '[Legal name, legal form, registered address, register number and VAT identification number to be provided by the owner.]',
        },
        {
          heading: 'Responsible for the content',
          body: '[Name and address of the person responsible for the content to be provided.]',
        },
        {
          heading: 'Contact',
          body: '[Professional e-mail address and phone number to be confirmed before publication.]',
        },
        {
          heading: 'Hosting',
          body: '[Name and address of the hosting provider to be completed once the hosting has been chosen.]',
        },
      ],
      fr: [
        {
          heading: 'Éditeur',
          body: "[Dénomination, forme juridique, adresse du siège, numéro d'immatriculation et numéro de TVA à fournir par le propriétaire.]",
        },
        {
          heading: 'Responsable de la publication',
          body: '[Nom et adresse du responsable de la publication à fournir.]',
        },
        {
          heading: 'Contact',
          body: '[Adresse e-mail et numéro de téléphone professionnels à confirmer avant publication.]',
        },
        {
          heading: 'Hébergement',
          body: "[Nom et adresse de l'hébergeur à compléter une fois l'hébergement choisi.]",
        },
      ],
      de: [
        {
          heading: 'Anbieter',
          body: '[Firmenname, Rechtsform, Sitz, Registernummer und Umsatzsteuer-Identifikationsnummer durch den Inhaber anzugeben.]',
        },
        {
          heading: 'Inhaltlich verantwortlich',
          body: '[Name und Anschrift der inhaltlich verantwortlichen Person anzugeben.]',
        },
        {
          heading: 'Kontakt',
          body: '[Berufliche E-Mail-Adresse und Telefonnummer vor Veröffentlichung zu bestätigen.]',
        },
        {
          heading: 'Hosting',
          body: '[Name und Anschrift des Hosting-Anbieters nach Auswahl zu ergänzen.]',
        },
      ],
    },
  },
  {
    type: 'privacy',
    title: legalDraft('Politique de confidentialité', 'Privacy policy', 'Datenschutzerklärung'),
    sections: {
      en: [
        {
          heading: 'Who processes your data',
          body: '[Controller identity and contact details to be provided.] Data is processed only to answer requests sent through the contact form.',
        },
        {
          heading: 'What is collected',
          body: 'The contact form collects: name, organisation (optional), e-mail address, country, type of request, subject and message, together with the timestamp of your consent. The server also records a technical, non-identifying counter used to limit abuse.',
        },
        {
          heading: 'Why',
          body: 'The legal basis is the consent you give when submitting the form, and the legitimate interest in preventing abuse of the form.',
        },
        {
          heading: 'How long',
          body: '[Retention period to be confirmed — recommended: 24 months after the last exchange, then deletion.]',
        },
        {
          heading: 'Who receives the data',
          body: 'The site owner and the e-mail provider used to deliver the notification. [Name of the e-mail provider to be added once configured.] No data is sold or used for advertising.',
        },
        {
          heading: 'Your rights',
          body: 'You may request access, correction, deletion, restriction or portability of your data, and lodge a complaint with a supervisory authority. [Contact address for such requests to be provided.]',
        },
      ],
      fr: [
        {
          heading: 'Qui traite vos données',
          body: '[Identité et coordonnées du responsable de traitement à fournir.] Les données sont traitées uniquement pour répondre aux demandes envoyées via le formulaire de contact.',
        },
        {
          heading: 'Données collectées',
          body: "Le formulaire de contact collecte : nom, organisation (facultatif), adresse e-mail, pays, type de demande, sujet et message, ainsi que l'horodatage de votre consentement. Le serveur enregistre également un compteur technique non identifiant destiné à limiter les abus.",
        },
        {
          heading: 'Finalités',
          body: "La base légale est le consentement donné lors de l'envoi du formulaire, ainsi que l'intérêt légitime à prévenir les abus.",
        },
        {
          heading: 'Durée de conservation',
          body: '[Durée à confirmer — recommandation : 24 mois après le dernier échange, puis suppression.]',
        },
        {
          heading: 'Destinataires',
          body: "Le propriétaire du site et le prestataire e-mail utilisé pour l'acheminement de la notification. [Nom du prestataire e-mail à ajouter après configuration.] Aucune donnée n'est vendue ni utilisée à des fins publicitaires.",
        },
        {
          heading: 'Vos droits',
          body: "Vous pouvez demander l'accès, la rectification, l'effacement, la limitation ou la portabilité de vos données, et introduire une réclamation auprès d'une autorité de contrôle. [Adresse de contact pour ces demandes à fournir.]",
        },
      ],
      de: [
        {
          heading: 'Wer Ihre Daten verarbeitet',
          body: '[Identität und Kontaktdaten des Verantwortlichen anzugeben.] Die Daten werden ausschließlich zur Beantwortung von Anfragen über das Kontaktformular verarbeitet.',
        },
        {
          heading: 'Welche Daten',
          body: 'Das Kontaktformular erhebt: Name, Organisation (optional), E-Mail-Adresse, Land, Art der Anfrage, Betreff und Nachricht sowie den Zeitpunkt Ihrer Einwilligung. Der Server speichert zusätzlich einen technischen, nicht identifizierenden Zähler zur Missbrauchsbegrenzung.',
        },
        {
          heading: 'Zweck',
          body: 'Rechtsgrundlage sind Ihre Einwilligung beim Absenden des Formulars sowie das berechtigte Interesse an der Missbrauchsvermeidung.',
        },
        {
          heading: 'Speicherdauer',
          body: '[Dauer zu bestätigen — Empfehlung: 24 Monate nach dem letzten Kontakt, danach Löschung.]',
        },
        {
          heading: 'Empfänger',
          body: 'Der Websitebetreiber und der E-Mail-Dienstleister für die Zustellung der Benachrichtigung. [Name des E-Mail-Dienstleisters nach Konfiguration ergänzen.] Es werden keine Daten verkauft oder für Werbung genutzt.',
        },
        {
          heading: 'Ihre Rechte',
          body: 'Sie können Auskunft, Berichtigung, Löschung, Einschränkung oder Übertragbarkeit verlangen und sich bei einer Aufsichtsbehörde beschweren. [Kontaktadresse für solche Anfragen anzugeben.]',
        },
      ],
    },
  },
  {
    type: 'cookies',
    title: legalDraft('Politique de cookies', 'Cookie policy', 'Cookie-Richtlinie'),
    sections: {
      en: [
        {
          heading: 'Cookies used by this website',
          body: 'This website stores two technical preferences on your device: the chosen language and the chosen colour theme. Both are strictly necessary to deliver the page you asked for and are never used for tracking.',
        },
        {
          heading: 'Analytics',
          body: 'No analytics script is loaded unless a privacy-friendly, cookieless analytics provider has been configured by the owner. [Provider to be confirmed.] If a provider requiring consent is added later, a consent banner must be activated at the same time.',
        },
        {
          heading: 'Third-party content',
          body: 'No third-party advertising, social widget or tracker is embedded in the pages.',
        },
      ],
      fr: [
        {
          heading: 'Cookies utilisés par ce site',
          body: "Ce site enregistre deux préférences techniques sur votre appareil : la langue choisie et le thème de couleurs choisi. Elles sont strictement nécessaires à l'affichage de la page demandée et ne servent jamais au traçage.",
        },
        {
          heading: 'Mesure d’audience',
          body: "Aucun script de mesure d'audience n'est chargé tant qu'un outil respectueux de la vie privée et sans cookie n'a pas été configuré par le propriétaire. [Outil à confirmer.] Si un outil nécessitant un consentement est ajouté ultérieurement, une bannière de consentement devra être activée simultanément.",
        },
        {
          heading: 'Contenus tiers',
          body: "Aucune publicité, aucun widget social et aucun traceur tiers n'est intégré dans les pages.",
        },
      ],
      de: [
        {
          heading: 'Von dieser Website genutzte Cookies',
          body: 'Diese Website speichert zwei technische Einstellungen auf Ihrem Gerät: die gewählte Sprache und das gewählte Farbschema. Beide sind zur Auslieferung der angeforderten Seite unbedingt erforderlich und dienen nie der Nachverfolgung.',
        },
        {
          heading: 'Reichweitenmessung',
          body: 'Es wird kein Analyseskript geladen, solange kein datenschutzfreundliches, cookiefreies Analysewerkzeug vom Betreiber konfiguriert wurde. [Anbieter zu bestätigen.] Wird später ein einwilligungspflichtiges Werkzeug ergänzt, muss gleichzeitig ein Consent-Banner aktiviert werden.',
        },
        {
          heading: 'Inhalte Dritter',
          body: 'Es sind keine Werbung, keine Social-Widgets und keine Tracker Dritter eingebunden.',
        },
      ],
    },
  },
  {
    type: 'terms',
    title: legalDraft(
      'Conditions générales',
      'Terms & conditions',
      'Allgemeine Geschäftsbedingungen',
    ),
    sections: {
      en: [
        {
          heading: 'Scope',
          body: '[To be drafted and validated legally.] These terms govern the use of this website. Consulting assignments are governed by a separate written agreement.',
        },
        {
          heading: 'Content and liability',
          body: '[To be validated.] The content published here is provided for information purposes and does not constitute investment, tax or legal advice.',
        },
        {
          heading: 'Intellectual property',
          body: '[To be validated.] Texts, images and documents published on this website remain the property of their author.',
        },
        {
          heading: 'Books and publications',
          body: 'Where a book is sold by an external retailer, the terms of that retailer apply. Direct sales are not activated on this website.',
        },
      ],
      fr: [
        {
          heading: 'Champ d’application',
          body: "[À rédiger et à valider juridiquement.] Les présentes conditions régissent l'utilisation de ce site. Les missions de conseil font l'objet d'un contrat écrit distinct.",
        },
        {
          heading: 'Contenus et responsabilité',
          body: '[À valider.] Les contenus publiés ici sont fournis à titre informatif et ne constituent pas un conseil en investissement, fiscal ou juridique.',
        },
        {
          heading: 'Propriété intellectuelle',
          body: '[À valider.] Les textes, images et documents publiés sur ce site restent la propriété de leur auteur.',
        },
        {
          heading: 'Livres et publications',
          body: "Lorsqu'un livre est vendu par une plateforme externe, les conditions de cette plateforme s'appliquent. La vente directe n'est pas activée sur ce site.",
        },
      ],
      de: [
        {
          heading: 'Geltungsbereich',
          body: '[Zu erstellen und juristisch freizugeben.] Diese Bedingungen regeln die Nutzung dieser Website. Beratungsmandate werden in einem gesonderten schriftlichen Vertrag geregelt.',
        },
        {
          heading: 'Inhalte und Haftung',
          body: '[Freizugeben.] Die hier veröffentlichten Inhalte dienen der Information und stellen keine Anlage-, Steuer- oder Rechtsberatung dar.',
        },
        {
          heading: 'Urheberrecht',
          body: '[Freizugeben.] Texte, Bilder und Dokumente dieser Website bleiben Eigentum ihres Urhebers.',
        },
        {
          heading: 'Bücher und Publikationen',
          body: 'Wird ein Buch über einen externen Anbieter verkauft, gelten dessen Bedingungen. Ein Direktverkauf ist auf dieser Website nicht aktiviert.',
        },
      ],
    },
  },
  {
    type: 'returns',
    title: legalDraft('Livraison et retours', 'Delivery & returns', 'Lieferung und Rückgabe'),
    sections: {
      en: [
        {
          heading: 'Status',
          body: 'Direct sales are not activated on this website. This page becomes applicable only if and when books are sold directly, and it must then be completed with the countries served, the shipping fees, the carrier, the delivery times and the statutory withdrawal period.',
        },
        {
          heading: 'External retailers',
          body: 'When a purchase link points to an external retailer, that retailer’s delivery and return conditions apply.',
        },
      ],
      fr: [
        {
          heading: 'Statut',
          body: "La vente directe n'est pas activée sur ce site. Cette page ne devient applicable que si des livres sont vendus directement ; elle devra alors être complétée avec les pays desservis, les frais de livraison, le transporteur, les délais et le droit de rétractation légal.",
        },
        {
          heading: 'Plateformes externes',
          body: "Lorsqu'un lien d'achat renvoie vers une plateforme externe, les conditions de livraison et de retour de cette plateforme s'appliquent.",
        },
      ],
      de: [
        {
          heading: 'Status',
          body: 'Auf dieser Website ist kein Direktverkauf aktiviert. Diese Seite gilt erst, wenn Bücher direkt verkauft werden; sie ist dann um Liefergebiete, Versandkosten, Versanddienstleister, Lieferzeiten und das gesetzliche Widerrufsrecht zu ergänzen.',
        },
        {
          heading: 'Externe Anbieter',
          body: 'Verweist ein Kauflink auf einen externen Anbieter, gelten dessen Liefer- und Rückgabebedingungen.',
        },
      ],
    },
  },
]
