export interface TemplateVariant {
  to: string
  cc: string
  subject: string
  body: string
  label: string
}

export interface PartnerTemplate {
  partner: string
  variants: TemplateVariant[]
}

export const SP_TEMPLATES: PartnerTemplate[] = [
  {
    partner: 'ACQUIRE',
    variants: [
      {
        to: 'rajat.sehgal@acquire.ai',
        cc: 'bdr-team@outsourceaccelerator.com',
        subject: "(OL) Meeting Confirmation: Acquire Intelligence <> [Lead's First and Last name] - Date of Appointment",
        label: 'Rajat Sehgal',
        body: `Hi {{ contact.firstname }} and Rajat,

I'm pleased to introduce you both, as I believe there's a valuable opportunity for collaboration between your companies. Below are the details of your upcoming meeting:

Date:
Time:
Meeting Location/Link:

Rajat, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Acquire Intelligence is an award-winning, global business outsourcer with 9,500+ staff and 20 years' experience in delivering intelligent contact center and back-office functions for global businesses across many industries including telecommunications, banking and financial services, insurance, media, education and retail. Acquire is an entrepreneurial business that is highly experienced in working with their partners to solve real-life problems quickly. A genuine partnership approach is at the heart of what they do. Their teams are highly proficient in exceeding expectations, especially in situations where in-house teams may be typically challenged with the business processes of "big business".

[Lead's First Name], we are excited for you to attend the Discovery Calls - and have created a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which will help you on this call. The handy guide includes some key questions you might want to ask the outsourcing experts.

I will leave you to speak with one another, but feel free to loop us in should you need anything from us. I hope the discussion goes well. Thank you and have a great week ahead!

Best regards,`,
      },
      {
        to: 'kirtna.charavda@acquirebpo.com',
        cc: 'bdr-team@outsourceaccelerator.com',
        subject: "(OL) Meeting Confirmation: Acquire Intelligence <> [Lead's First and Last name] - Date of Appointment",
        label: 'Kirtna Charavda',
        body: `Hi {{ contact.firstname }} and Kirtna,

I'm pleased to introduce you both, as I believe there's a valuable opportunity for collaboration between your companies. Below are the details of your upcoming meeting:

Date:
Time:
Meeting Location/Link:

Kirtna, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Acquire Intelligence is an award-winning, global business outsourcer with 9,500+ staff and 20 years' experience in delivering intelligent contact center and back-office functions for global businesses across many industries including telecommunications, banking and financial services, insurance, media, education and retail. Acquire is an entrepreneurial business that is highly experienced in working with their partners to solve real-life problems quickly. A genuine partnership approach is at the heart of what they do. Their teams are highly proficient in exceeding expectations, especially in situations where in-house teams may be typically challenged with the business processes of "big business".

[Lead's First Name], we are excited for you to attend the Discovery Calls - and have created a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which will help you on this call. The handy guide includes some key questions you might want to ask the outsourcing experts.

I will leave you to speak with one another, but feel free to loop us in should you need anything from us. I hope the discussion goes well. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'ARCANYS',
    variants: [
      {
        to: 'fred@arcanys.com',
        cc: '',
        subject: "Meeting Confirmation: Arcanys <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Arcanys Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Arcanys' proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Arcanys](https://www.arcanys.com/about) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Arcanys is a 360+ people strong Swiss-founded software development and team augmentation company based in the Philippines, helping tech-enabled companies scale with dedicated full-time developers, QA, UX/UI, cloud support, AI/data specialists, and CTO-on-demand services. We work best with founders and teams looking for a long-term technology partner, not just outsourced labor, with developers integrated closely into the client's team. Typical engagements start around 2-3 full-time developers, with budgets usually from roughly USD 4,500/month per developer. We complement developers with technical leadership, QA, or project management whenever required. The goal of a first call with one of the founders is to see whether there is a real fit in scope, budget, and long-term ambition before involving the delivery team.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Arcanys offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'AZENDO',
    variants: [
      {
        to: 'jm@azendo.co',
        cc: '',
        subject: "Meeting Confirmation: Azendo <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Azendo Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Azendo's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Azendo](https://azendo.co/about-azendo/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Azendo is a Danish-owned offshore staffing partner with over 14 years of experience and a growing team of more than 100 professionals based in Thailand, and recently, in the Philippines. Utilizing a global sourcing model, they look beyond local markets to identify top-tier talent from around the world to build dedicated, high-performing teams. They offer a comprehensive 360-degree solution managing the entire talent lifecycle, from recruitment and relocation to ongoing HR support, driven by a "Humans first, resources after" philosophy. This approach provides partners with ease of mind by handling all personnel matters while significantly reducing operational costs and ensuring long-term success.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Azendo offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'CALLMAX SOLUTIONS',
    variants: [
      {
        to: 'c.mojica@callmaxsolutions.com,Jeremiah@callmaxsolutions.com',
        cc: '',
        subject: "Meeting Confirmation: Callmax <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Callmax Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Callmax's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Callmax](https://www.vaplatinum.com.au/ph/about-us) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Callmax is an innovative Business Process Outsourcing (BPO) services provider headquartered in New York. This firm takes pride in its customer-centric approach in providing committed call center solutions for businesses of any size. One significant incentive of using their engagement channels to communicate with customers is a multilingual option.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Callmax offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'CC.TALENT',
    variants: [
      {
        to: 'madonna.mendoza@cctalent.global',
        cc: '',
        subject: "Meeting Confirmation: CC.Talent Group <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and CC.Talent Group Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident CC.Talent Group's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[CC.Talent Group](https://cctalent.global/en/about-us) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, CC.Talent Group, founded in the Netherlands, is an ISO-certified outsourcing partner that connects companies with qualified remote professionals. With extensive development experience and a strong foundation in marketing and sales since 2012, the group has established two distinct labels. CC.Create serves as its development arm, providing both end-to-end solutions and staff augmentation, while CC.Talent focuses on operational outsourcing, helping businesses gain traction, expand into new markets, and accelerate revenue growth.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning CC.Talent Group offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'CEBU TELENET',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: Cebu Tele-net <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Cebu Tele-net Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Cebu Tele-net's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Cebu Tele-net](https://cebutele-net.com/about/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Cebu Tele-net is a premier Business Process Outsourcing (BPO) provider dedicated to helping businesses succeed through tailored outsourcing solutions. They specialize in delivering high-quality services across a range of industries. What sets them apart is their commitment to quality, innovation, and reliability. From their robust infrastructure to their performance-driven teams, they ensure that your business is supported by a partner you can trust. Whether you're looking to enhance customer experience, improve operational efficiency, or scale your business, they are here to help you achieve your goals.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Cebu Tele-net offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'CONNECTOS',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: ConnectOS <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and ConnectOS Talent Partners Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident ConnectOS Talent Partners' proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[ConnectOS](https://connectos.co/about-connectos/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, ConnectOS Talent Partners is a 23-year-old recruitment firm specializing in delivering high-performing global talent for fast-growing companies. The team provides both contract and direct-hire solutions, with strong expertise in U.S. and Philippines-based staffing. Known for speed, quality, and transparency, ConnectOS supports clients across marketing, operations, technology, and customer experience. Their goal is to help organizations scale quickly with reliable, well-vetted talent.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning ConnectOS Talent Partners offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'CS-PAC GLOBAL SOLUTIONS',
    variants: [
      {
        to: 'dominicdeleon@cs-pac.com,arnoldescobedo@cs-pac.com,livmarcelo@cs-pac.com',
        cc: '',
        subject: "Meeting Confirmation: CS-PAC Global Solutions <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and CS-Pac Global Solutions Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident CS-Pac's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[CS-Pac Global Solutions](https://join.cs-pac.com/faqs) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, CS-Pac Global Solutions provides skilled, English-proficient, and tech-savvy Filipino professionals, with a strong focus on back-office, administrative, and non-voice support. From data entry, documentation, bookkeeping, and chat and email customer support to digital marketing, social media management, and graphic design, they help businesses build reliable teams, while remaining flexible to support other functions as needed.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning CS-Pac Global Solutions offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'EASTVANTAGE',
    variants: [
      {
        to: 'reina.elca@eastvantage.com',
        cc: '',
        subject: "[OL] Meeting Confirmation: Eastvantage <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Eastvantage Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Eastvantage's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

Eastvantage Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Eastvantage is a global business solutions partner headquartered in Bulgaria, with delivery centers across strategic locations in Asia and Europe. Since 2010, the company has been empowering businesses worldwide through customized outsourcing services designed to drive efficiency and scalability. Eastvantage specializes in Business Process Management (BPM), Technology, and Professional Services, providing expertise in Customer Experience, Back Office Support, IT and Software Development, Finance & Accounting, and Recruitment Process Outsourcing (RPO). By combining global standards with local expertise, Eastvantage enables its partners to focus on growth while achieving measurable business impact.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Eastvantage offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'EXPEDOCK',
    variants: [
      {
        to: 'lance@expedock.com,jeff@expedock.com,sales@expedock.com',
        cc: '',
        subject: "Meeting Confirmation: Expedock <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Expedock Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Expedock's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Expedock](https://www.expedock.com/about-us) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Expedock is a tech-enabled solutions provider helping businesses scale through a combination of flexible offshore support and AI-powered automation. Founded in San Francisco in 2019 with $21M raised, Expedock is supporting 60+ global businesses spanning different industries such as Tech, Real Estate, Logistics and Finance. We provide end-to-end services across operations, customer support, finance, sales, and data management, seamlessly integrating into existing workflows to boost efficiency, improve visibility, and allow teams to focus on high-impact work.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Expedock offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'HGS OSS',
    variants: [
      {
        to: 'dillon.esteban@teamhgs.com,Praneeth.Marisa@teamhgs.com',
        cc: '',
        subject: "Meeting Confirmation: HGS OSS <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and HGS OSS Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident HGS OSS's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[HGS OSS](https://oss.hgs.com/specialist-in-large-teams/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, HGS OSS prides itself in providing a world-class offshore team for medium and large businesses, whether public or private. They aim to take businesses to the next level when it comes to acquiring talents in back-office support, customer service, finance & accounting, digital marketing, web development, and virtual assistance.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning HGS OSS offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'HGS UK',
    variants: [
      {
        to: 'jacqueline.chapman@teamhgs.com',
        cc: '',
        subject: "Meeting Confirmation: HGS UK <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and HGS UK Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident HGS UK's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[HGS UK](https://oss.hgs.com/specialist-in-large-teams/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, HGS UK prides itself in providing a world-class offshore team for medium and large businesses, whether public or private. They aim to take businesses to the next level when it comes to acquiring talents in back-office support, customer service, finance & accounting, digital marketing, web development, and virtual assistance.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning HGS UK offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'HOPLA',
    variants: [
      {
        to: 'jenn@hopla.online,camilled@hopla.online,josephbryang@hopla.online,mae@hopla.online',
        cc: '',
        subject: "Meeting Confirmation: HOPLA <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and HOPLA Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident HOPLA's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[HOPLA Team,](https://hopla.online/our-solutions/) {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, HOPLA helps businesses scale fast with exceptional remote talent, any role, anywhere. We design flexible staffing solutions that fit exactly what your company needs, whether you're growing a single team or building an entire remote workforce. Their approach combines smart recruitment technology, personalized onboarding and coaching, AI-powered performance & productivity monitoring, and dedicated account management, so your team stays productive, engaged, and delivering top-quality work. With HOPLA, you don't just fill roles, you build high-performing teams that thrive in a fully remote environment.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning HOPLA offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'INTEGRATED OS',
    variants: [
      {
        to: 'Partner.Solutions@integratedos.com',
        cc: 'rodneyfrost@lamsongroup.com.au,margaux.monteiro@integratedos.com',
        subject: "Meeting Confirmation: Integrated OS <> [Lead's First and Last name] - Date of Appointment",
        label: 'Partner Solutions',
        body: `Hi {{ contact.firstname }} and Integrated OS Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident IntegratedOS' proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[IntegratedOS](https://integratedos.com/see-if-were-a-fit/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Integrated OS was formed in 2006 to allow them to reach other Partners in different Industries. They have and are continuing to help more than 50 Australian businesses focus on their goals by facilitating recruitment and setting up their own dedicated offshore teams in the Philippines.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Integrated OS offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
      {
        to: 'jerico@outposter.com.au',
        cc: '',
        subject: "Meeting Confirmation: Outposter <> [Lead's First and Last name] - Date of Appointment",
        label: 'Jerico (Outposter)',
        body: `Hi {{ contact.firstname }} and Jerico/Outposter Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Outposter's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Outposter](https://outposter.com.au/about-us/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Outposter is a leading global outsourcing company, headquartered in Brisbane, Australia, with offices in the Philippines, Singapore, and India. They provide staffing solutions to both large and small companies, short or long term projects. Outsourcing can be a gamble and they remove the risk by providing highly skilled staff, trained and vetted by them, so they stand by the quality of their work. Their staff can provide customer support, direct marketing, social media marketing, graphic design, and more.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Outposter offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
      {
        to: 'arnold@outposter.com.au',
        cc: '',
        subject: "Meeting Confirmation: Outposter <> [Lead's First and Last name] - Date of Appointment",
        label: 'Arnold (Outposter)',
        body: `Hi {{ contact.firstname }} and Arnold,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Outposter's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Outposter](https://outposter.com.au/about-us/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Outposter is a leading global outsourcing company, headquartered in Brisbane, Australia, with offices in the Philippines, Singapore, and India. They provide staffing solutions to both large and small companies, short or long term projects. Outsourcing can be a gamble and they remove the risk by providing highly skilled staff, trained and vetted by them, so they stand by the quality of their work. Their staff can provide customer support, direct marketing, social media marketing, graphic design, and more.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Outposter offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'INTELLIWORX',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: Intelliworx <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }}, Veronica and Brent,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Intelliworx PH's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

Date:
Time:
Meeting Location/Link:

Veronica and Brent, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Intelliworx PH pride themselves on delivering exceptional outsourcing services to clients across various industries. Their team of skilled professionals is dedicated to providing high-quality solutions that are tailored to meet each client's unique needs. With their expertise in graphic design, customer support, web development, and digital marketing, they can help businesses streamline their processes and increase efficiency, ultimately resulting in cost savings and increased productivity.

They take a personalized approach to customer service, taking the time to understand each client's business and goals to ensure that our outsourcing solutions align with their needs and objectives. They are an excellent choice for businesses looking to outsource their operations to a reliable and experienced partner.

Crucial Next Step to Maximize Your Time:
[Lead's First Name], we are excited for you to attend the Discovery Calls - and have created a [valuable guide to outsourcing](https://drive.google.com/file/d/16mc_6wvwXlgeH1inClOyFCeKILRx-zR6/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which will help you on this call. The handy guide includes some key questions you might want to ask the outsourcing experts.

I will leave you to speak with one another, but feel free to loop us in should you need anything from us. I hope the discussion goes well. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'OA (BIZ DEV)',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: Outsource Accelerator <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Outsource Accelerator Business Development Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident that our Business Development Team with Outsource Accelerator's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Outsource Accelerator](https://www.outsourceaccelerator.com/about/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Outsource Accelerator is the world's leading outsourcing marketplace and advisory platform, helping companies build and scale high-performing offshore teams. The company connects businesses with vetted BPO providers and outsourcing partners while offering expert guidance throughout the outsourcing journey - from provider selection and workforce strategy to implementation and long-term scaling. With deep industry expertise and access to thousands of outsourcing suppliers globally, Outsource Accelerator enables businesses to reduce costs, improve operational efficiency, and rapidly expand their capabilities through offshore talent. Their platform and advisory services are trusted by organizations worldwide looking to optimize operations and unlock the full potential of outsourcing.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1fCz2JSSUH_PIEGa4HzwEejoFEf2T5hwo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Outsource Accelerator offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'PANDR',
    variants: [
      {
        to: 'jesse.k@pandroutsourcing.com',
        cc: '',
        subject: "(SP 2.0) Meeting Confirmation: PANDR <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and PANDR Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident PANDR's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[PANDR](https://www.pandroutsourcing.com/about/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, PANDR works with hundreds of amazing people who help businesses just like yours with their outsourcing needs and each one of them is like a family. They are made up of hundreds of amazing offshore staff members who manage everything from marketing, sales, IT, and much more for a wide range of global businesses. They only hire, train, and work with the very best talents which set them apart from their competition. The average PANDR-managed staff member stays with the business for over 3 years. That means less hassles and a better working relationship for your business. They only care about providing their clients with the absolute best possible staff and service possible.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning PANDR offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'PENTWATER',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: Pentwater <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Pentwater Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Pentwater's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Pentwater](https://pentwaterconnect.com/about-us/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Pentwater helps visionary entrepreneurs grow faster by making outsourcing easy, affordable, and high-quality. With Pentwater, you get access to digital marketing, customer service and sales support, SEO, eCommerce support, accounting, back-office operations, and more, all at up to 80% savings. There are no long-term contracts, and you can cancel anytime. Their ultra-low rates start at just 14 cents per minute, and you only pay for the minutes you use. Best of all, they deliver top 2% quality talent, with every team member working onsite at their professional offices in Davao, Philippines. No remote workers. No headaches.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Pentwater offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'PEOPLEPARTNERS BPO',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: People Partners BPO <> [Lead's First and Last name] - Date of Appointment",
        label: 'People Partners Team',
        body: `Hi {{ contact.firstname }} and People Partners Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident People Partners' proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

Riaz, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, [PeoplePartners](https://peoplepartnersbpo.com/who-we-are/our-story/) is an ISO-certified strategic workforce partner built on proven systems and globally recognised standards. They run on EOS, are Great Place to Work certified, and were named a Fortune 100 Best Companies to Work For in Southeast Asia in 2025, ensuring consistency, security, and a culture that performs. Serving clients across Australia, the US, Canada, and New Zealand, PeoplePartners designs dedicated offshore teams around each business, re-engineering workforce structures to deliver up to 70% cost savings without sacrificing performance or values. Backed by zero upfront costs, no long-term lock-in, and a 90-day replacement guarantee, they give clients the freedom to scale confidently, focus on growth, and build teams that create lasting impact.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning People Partners BPO offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
      {
        to: 'pren.naidoo@peoplepartnersbpo.com',
        cc: '',
        subject: "Meeting Confirmation: People Partners BPO <> [Lead's First and Last name] - Date of Appointment",
        label: 'Pren Naidoo',
        body: `Hi {{ contact.firstname }} and People Partners Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident People Partners' proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

Roumayne, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, [PeoplePartners](https://peoplepartnersbpo.com/who-we-are/our-story/) is an ISO-certified strategic workforce partner built on proven systems and globally recognised standards. They run on EOS, are Great Place to Work certified, and were named a Fortune 100 Best Companies to Work For in Southeast Asia in 2025, ensuring consistency, security, and a culture that performs. Serving clients across Australia, the US, Canada, and New Zealand, PeoplePartners designs dedicated offshore teams around each business, re-engineering workforce structures to deliver up to 70% cost savings without sacrificing performance or values. Backed by zero upfront costs, no long-term lock-in, and a 90-day replacement guarantee, they give clients the freedom to scale confidently, focus on growth, and build teams that create lasting impact.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning People Partners BPO offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'REMOTE EMPLOYEE',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: Remote Employee <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Remote Employee Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Remote Employee's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Remote Employee](https://remoteemployee.ph/about) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Remote Employee is a global BPO company that helps global talent find world class employers. They enable businesses to easily access the global workforce for various fields.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Remote Employee offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'SATELLITE OFFICE',
    variants: [
      {
        to: 'MarkR@satelliteoffice.com,jmcalmond@satelliteoffice.com',
        cc: '',
        subject: "Meeting Confirmation: Satellite Office <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Satellite Office Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Satellite Office's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Satellite Office](https://www.satelliteoffice.com/why-choose-satellite-office/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Satellite Office helps businesses build high-performing offshore teams in the Philippines, enabling them to scale efficiently, save up to 70% on staffing costs, and maintain exceptional quality. With expertise across a wide range of functions including Customer Experience, Finance & Accounting, IT Support, Software Development, Sales, Marketing, Operations, and more, they provide dedicated offshore professionals who work directly with client leadership teams for full cultural and operational alignment. Backed by over 12 years of industry experience and trusted by global brands across multiple sectors, Satellite Office is ISO-27001 and HIPAA certified, ensuring strong data security and compliance. As a strategic partner, they develop tailored offshoring solutions that streamline processes and support sustainable, long-term growth.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Satellite Office offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'SIRIUS',
    variants: [
      {
        to: 'craig@sirius-support.com,karen.infantado@sirius-support.com',
        cc: '',
        subject: "Meeting Confirmation: Sirius Support <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Sirius Support Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Sirius Support's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Sirius Support Team,](https://www.sirius-support.com/resources/aboutus) {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Sirius Support is a human-centered, AI-powered customer support company built by leaders with deep experience scaling world-class service teams. We deliver flexible virtual contact center services, expertly trained global teams, and technology that adapts as you grow. Our focus is simple: combine innovation, insight, and operational excellence to drive measurable results and sustainable growth for your business.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Sirius Support offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'SIX ELEVEN',
    variants: [
      {
        to: 'kris.sanchez@sixeleven.com',
        cc: '',
        subject: "Meeting Confirmation: Six Eleven <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Six Eleven Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Six Eleven's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Six Eleven](https://www.sixelevenbpo.com/about-us/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Six Eleven is an 18-year-old call center and BPO company with over 5,500 full-time staff and 6 service delivery centers in the Philippines. They are PCI, HIPAA, ISO, and SOC2 certified, ensuring a secure and productive work environment for their clients and projects.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Six Eleven offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'SOURCEFIT',
    variants: [
      {
        to: '',
        cc: '',
        subject: "Meeting Confirmation: Sourcefit <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and Sourcefit Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident Sourcefit's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[Sourcefit](https://sourcefit.com/why-sourcefit/) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, Sourcefit offers staff augmentation and fully managed services to companies in the E-Commerce, IT, Finance, Hospitality, Healthcare, Construction, Retail, Telecom, Logistics, and Marketing Industries, among others. They specialize in building dedicated teams that function as seamlessly as local staff, with minimal start-up risk and maximum transparency, control and long-term return on investment.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning Sourcefit offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'VA PLATINUM',
    variants: [
      {
        to: 'pedro@vaplatinum.com.au',
        cc: 'bel.l@vaplatinum.com.au',
        subject: "Meeting Confirmation: VA Platinum <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and VA Platinum Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident VA Platinum's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[VA Platinum](https://www.vaplatinum.com.au/ph/about-us) Team, {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, VAP is an Australian-owned staffing provider that helps businesses scale efficiently with highly skilled offshore talent. The company specialises in recruitment, onboarding, coaching, and ongoing management to ensure team members deliver consistently high performance and customer service. With teams based in Cebu and Davao, Philippines, VAP supports hundreds of Australian businesses across multiple industries. Their focus is on long-term partnerships, quality control, digital security and compliance and seamless integration of VAs into clients' existing teams and processes.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning VA Platinum offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
  {
    partner: 'ZIGZAG',
    variants: [
      {
        to: 'wil@zigzagoffshoring.com,kino@zigzagoffshoring.com',
        cc: '',
        subject: "Meeting Confirmation: ZigZag <> [Lead's First and Last name] - Date of Appointment",
        label: 'Default',
        body: `Hi {{ contact.firstname }} and ZigZag Team,

I'm pleased to formally connect you both. This meeting represents a strategic opportunity, and I'm confident ZigZag's proven expertise aligns perfectly with your goals for {{ contact.quote_role_to_outsource }}.

To ensure you have everything locked in, here are the details for your upcoming discussion:

Date:
Time:
Meeting Location/Link:

[ZigZag Team,](https://zigzagoffshoring.com/services/#faq) {{ contact.firstname }} is the [Job Title] at [Company]. They are interested in exploring strategic solutions for {{ contact.quote_role_to_outsource }}.

{{ contact.firstname }}, ZigZag provides a fully serviced partnership for growing businesses, delivering end-to-end solutions tailored to each company's unique staffing needs and operational requirements. By managing all employment logistics for your offshore team, ZigZag allows you to focus on day-to-day operations and core business priorities. Their approach blends agile leadership principles with customized support, ensuring teams are set up for growth without the administrative burden.

Crucial Next Step to Maximize Your Time:
{{ contact.firstname }}, we want to make sure your Discovery Call is as productive as possible. We've attached a [valuable guide to outsourcing](https://drive.google.com/file/d/1d6F-DQKVM65h3KE5CnQKJqaee-FMxUuo/view?usp=sharing) and an [outsourcing whitepaper](https://drive.google.com/file/d/1itLCO15HxDEUC8gK4FXpGQ6WmB_ZeW5b/view?usp=sharing), which includes key, data-driven questions that will help you quickly dive into the strategic planning ZigZag offers. Reviewing this guide before the call is the best way to ensure you walk away with immediate, actionable insights.

I will leave you to connect, but feel free to loop us in if you need anything at all. I look forward to hearing about the operational growth you'll unlock. Thank you and have a great week ahead!

Best regards,`,
      },
    ],
  },
]
