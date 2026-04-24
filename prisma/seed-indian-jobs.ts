import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🧹 Clearing existing jobs, applications, saved jobs...');

  await prisma.savedJob.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.company.deleteMany({});

  console.log('✅ Cleared all jobs and related data.');

  // Find recruiter sarah@techcorp.com
  const recruiter = await prisma.user.findUnique({ where: { email: 'raniv2057@gmail.com' } });
  if (!recruiter) {
    console.error('❌ Recruiter sarah@techcorp.com not found!');
    process.exit(1);
  }
  console.log(`✅ Found recruiter: ${recruiter.name} (${recruiter.id})`);

  // Create 25 Indian companies
  const companies = [
    { name: 'Tata Consultancy Services', description: 'TCS is India\'s largest IT services company, offering consulting, technology, and digital transformation services to global enterprises across 150+ locations worldwide.', website: 'https://www.tcs.com', location: 'Mumbai, Maharashtra', industry: 'Information Technology', size: '500+', foundedYear: 1968 },
    { name: 'Infosys', description: 'Infosys is a global leader in next-generation digital services and consulting. We enable clients in over 50 countries to navigate their digital transformation.', website: 'https://www.infosys.com', location: 'Bengaluru, Karnataka', industry: 'Information Technology', size: '500+', foundedYear: 1981 },
    { name: 'Wipro', description: 'Wipro is a leading technology services and consulting company focused on building innovative solutions that address the most complex digital transformation needs.', website: 'https://www.wipro.com', location: 'Bengaluru, Karnataka', industry: 'Information Technology', size: '500+', foundedYear: 1945 },
    { name: 'HCL Technologies', description: 'HCLTech is a next-generation global technology company that helps enterprises reimagine their businesses for the digital age.', website: 'https://www.hcltech.com', location: 'Noida, Uttar Pradesh', industry: 'Information Technology', size: '500+', foundedYear: 1991 },
    { name: 'Reliance Jio', description: 'Reliance Jio is India\'s largest telecom operator and a leading digital services platform, transforming India with affordable connectivity and digital solutions.', website: 'https://www.jio.com', location: 'Navi Mumbai, Maharashtra', industry: 'Telecommunications', size: '500+', foundedYear: 2007 },
    { name: 'Flipkart', description: 'Flipkart is India\'s leading e-commerce marketplace offering millions of products across categories with innovative logistics and technology solutions.', website: 'https://www.flipkart.com', location: 'Bengaluru, Karnataka', industry: 'E-Commerce', size: '500+', foundedYear: 2007 },
    { name: 'Zoho Corporation', description: 'Zoho builds beautifully crafted business and productivity software with a focus on privacy and customer satisfaction. Over 100 million users worldwide.', website: 'https://www.zoho.com', location: 'Chennai, Tamil Nadu', industry: 'SaaS / Cloud Software', size: '201-500', foundedYear: 1996 },
    { name: 'Freshworks', description: 'Freshworks makes business software that people love to use. Our cloud-based suite is designed to help businesses engage with their customers and employees.', website: 'https://www.freshworks.com', location: 'Chennai, Tamil Nadu', industry: 'SaaS / Cloud Software', size: '201-500', foundedYear: 2010 },
    { name: 'Razorpay', description: 'Razorpay is India\'s leading full-stack fintech company providing payment gateway, banking, and business finance solutions to businesses of all sizes.', website: 'https://razorpay.com', location: 'Bengaluru, Karnataka', industry: 'Fintech', size: '201-500', foundedYear: 2014 },
    { name: 'PhonePe', description: 'PhonePe is India\'s leading digital payments platform enabling seamless UPI transactions, investments, insurance, and more for over 500 million users.', website: 'https://www.phonepe.com', location: 'Bengaluru, Karnataka', industry: 'Fintech', size: '500+', foundedYear: 2015 },
    { name: 'CRED', description: 'CRED is a fintech platform that rewards creditworthy individuals for responsible financial behaviour. Built for a community of trustworthy and positive-minded individuals.', website: 'https://cred.club', location: 'Bengaluru, Karnataka', industry: 'Fintech', size: '51-200', foundedYear: 2018 },
    { name: 'Swiggy', description: 'Swiggy is India\'s leading on-demand delivery platform for food, groceries, and essentials, serving millions of users across 500+ cities.', website: 'https://www.swiggy.com', location: 'Bengaluru, Karnataka', industry: 'Food Tech / Delivery', size: '500+', foundedYear: 2014 },
    { name: 'Zomato', description: 'Zomato is a technology platform connecting customers, restaurant partners, and delivery partners, serving food, groceries, and hyperpure supplies.', website: 'https://www.zomato.com', location: 'Gurugram, Haryana', industry: 'Food Tech / Delivery', size: '500+', foundedYear: 2008 },
    { name: 'Ola Electric', description: 'Ola Electric is building India\'s EV revolution with its range of electric scooters and plans for electric cars, powered by cutting-edge battery technology.', website: 'https://www.olaelectric.com', location: 'Bengaluru, Karnataka', industry: 'Electric Vehicles', size: '201-500', foundedYear: 2017 },
    { name: 'Dream11', description: 'Dream11 is India\'s largest fantasy sports platform with over 200 million users, offering fantasy cricket, football, basketball, and more.', website: 'https://www.dream11.com', location: 'Mumbai, Maharashtra', industry: 'Sports Tech / Gaming', size: '201-500', foundedYear: 2008 },
    { name: 'Byju\'s', description: 'BYJU\'S is a leading EdTech company creating engaging learning experiences for students across K-12 and competitive exam preparation.', website: 'https://byjus.com', location: 'Bengaluru, Karnataka', industry: 'EdTech', size: '500+', foundedYear: 2011 },
    { name: 'Meesho', description: 'Meesho is India\'s fastest-growing e-commerce platform enabling small businesses and entrepreneurs to start online stores with zero investment.', website: 'https://meesho.com', location: 'Bengaluru, Karnataka', industry: 'E-Commerce', size: '201-500', foundedYear: 2015 },
    { name: 'Zerodha', description: 'Zerodha is India\'s largest stock brokerage firm offering zero-brokerage equity investments and cutting-edge trading platforms like Kite and Console.', website: 'https://zerodha.com', location: 'Bengaluru, Karnataka', industry: 'Fintech / Stock Brokerage', size: '51-200', foundedYear: 2010 },
    { name: 'Postman', description: 'Postman is an API platform for building and using APIs. Postman simplifies every step of the API lifecycle and streamlines collaboration for faster development.', website: 'https://www.postman.com', location: 'Bengaluru, Karnataka', industry: 'Developer Tools', size: '201-500', foundedYear: 2014 },
    { name: 'Groww', description: 'Groww is an investment platform offering stocks, mutual funds, fixed deposits, and US stocks to millions of investors with a simple, transparent experience.', website: 'https://groww.in', location: 'Bengaluru, Karnataka', industry: 'Fintech / Investments', size: '201-500', foundedYear: 2016 },
    { name: 'Lenskart', description: 'Lenskart is India\'s largest eyewear company offering prescription eyeglasses, sunglasses, and contact lenses through technology-driven retail.', website: 'https://www.lenskart.com', location: 'Gurugram, Haryana', industry: 'E-Commerce / Retail', size: '201-500', foundedYear: 2010 },
    { name: 'Paytm', description: 'Paytm is India\'s leading fintech ecosystem offering digital payments, banking, wealth management, lending, and e-commerce services to millions.', website: 'https://paytm.com', location: 'Noida, Uttar Pradesh', industry: 'Fintech', size: '500+', foundedYear: 2010 },
    { name: 'Nykaa', description: 'Nykaa is India\'s leading lifestyle and beauty e-commerce platform with a curated collection of beauty, wellness, and fashion products.', website: 'https://www.nykaa.com', location: 'Mumbai, Maharashtra', industry: 'E-Commerce / Beauty', size: '201-500', foundedYear: 2012 },
    { name: 'upGrad', description: 'upGrad is South Asia\'s largest online higher education company offering industry-relevant programs in collaboration with top universities worldwide.', website: 'https://www.upgrad.com', location: 'Mumbai, Maharashtra', industry: 'EdTech', size: '201-500', foundedYear: 2015 },
    { name: 'ShareChat', description: 'ShareChat is India\'s leading social media platform for Bharat, serving content in 15 Indian languages through ShareChat and short-video platform Moj.', website: 'https://sharechat.com', location: 'Bengaluru, Karnataka', industry: 'Social Media', size: '201-500', foundedYear: 2015 },
  ];

  // Create companies
  const createdCompanies = [];
  for (const c of companies) {
    const created = await prisma.company.create({
      data: {
        ...c,
        recruiterId: recruiter.id,
      },
    });
    createdCompanies.push(created);
  }
  console.log(`✅ Created ${createdCompanies.length} Indian companies.`);

  // Job postings — one per company
  const jobPostings = [
    // 1. TCS
    { companyIdx: 0, title: 'Senior Java Developer', description: '## About the Role\n\nJoin TCS Digital Engineering to build enterprise-grade Java applications for Fortune 500 clients.\n\n## Responsibilities\n- Design and develop Java-based microservices using Spring Boot\n- Implement REST APIs and integrate with cloud-native services\n- Conduct code reviews and mentor L1/L2 developers\n- Collaborate with cross-functional Agile teams\n\n## Requirements\n- 5+ years of experience in Java/J2EE\n- Strong Spring Boot, Hibernate, and Microservices knowledge\n- Experience with AWS or Azure cloud platforms\n- Excellent communication skills', type: 'FULL_TIME', location: 'Mumbai, Maharashtra', salaryMin: 1400000, salaryMax: 2200000, remote: false, skills: 'Java,Spring Boot,Microservices,AWS,Hibernate,REST APIs', deadline: new Date('2025-08-15') },

    // 2. Infosys
    { companyIdx: 1, title: 'Full Stack Developer (React + Node)', description: '## About the Role\n\nInfosys is looking for Full Stack Developers to join our Digital Experience team in Bengaluru.\n\n## Responsibilities\n- Build responsive web applications using React.js and Node.js\n- Design and implement RESTful APIs and GraphQL endpoints\n- Work with MongoDB and PostgreSQL databases\n- Participate in Agile ceremonies and sprint planning\n\n## Requirements\n- 3+ years of experience in full-stack development\n- Proficiency in React, Node.js, and TypeScript\n- Experience with CI/CD pipelines\n- B.Tech/B.E. in Computer Science or equivalent', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 1000000, salaryMax: 1800000, remote: true, skills: 'React,Node.js,TypeScript,MongoDB,PostgreSQL,GraphQL', deadline: new Date('2025-07-30') },

    // 3. Wipro
    { companyIdx: 2, title: 'Cloud Solutions Architect', description: '## About the Role\n\nWipro FullStride Cloud is hiring Cloud Solutions Architects to design multi-cloud solutions for enterprise clients.\n\n## Responsibilities\n- Architect cloud-native solutions on AWS, Azure, and GCP\n- Lead cloud migration and modernization projects\n- Create technical design documents and architecture blueprints\n- Evaluate and recommend cloud tools and services\n\n## Requirements\n- 7+ years in IT with 4+ years in cloud architecture\n- AWS Solutions Architect or Azure Architect certification\n- Experience with Terraform, Kubernetes, and Docker\n- Strong presentation and stakeholder management skills', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 2500000, salaryMax: 4000000, remote: true, skills: 'AWS,Azure,GCP,Terraform,Kubernetes,Docker,Architecture', deadline: new Date('2025-09-01') },

    // 4. HCL Technologies
    { companyIdx: 3, title: 'SAP ABAP Consultant', description: '## About the Role\n\nHCLTech is hiring SAP ABAP Consultants for our enterprise solutions practice.\n\n## Responsibilities\n- Develop custom ABAP programs, reports, and interfaces\n- Support SAP S/4HANA migration projects\n- Create functional and technical design specifications\n- Debug and optimize existing SAP modules\n\n## Requirements\n- 4+ years of SAP ABAP development experience\n- Knowledge of SAP FICO, MM, or SD modules\n- Experience with SAP HANA and S/4HANA\n- SAP certification preferred', type: 'FULL_TIME', location: 'Noida, Uttar Pradesh', salaryMin: 1200000, salaryMax: 2000000, remote: false, skills: 'SAP,ABAP,S/4HANA,FICO,SAP HANA,Enterprise Solutions', deadline: new Date('2025-08-20') },

    // 5. Reliance Jio
    { companyIdx: 4, title: '5G Network Engineer', description: '## About the Role\n\nJoin Jio\'s 5G engineering team to build and optimize India\'s most advanced telecommunications network.\n\n## Responsibilities\n- Plan, design, and optimize 5G RAN and Core networks\n- Perform network performance analysis and capacity planning\n- Troubleshoot network issues and drive KPI improvements\n- Work with vendors on equipment deployment and integration\n\n## Requirements\n- 3+ years in telecom/network engineering\n- Knowledge of 5G NR, LTE, and core network architecture\n- Experience with network planning tools\n- B.Tech in Electronics/Telecommunications', type: 'FULL_TIME', location: 'Navi Mumbai, Maharashtra', salaryMin: 1200000, salaryMax: 2000000, remote: false, skills: '5G,LTE,Network Planning,Telecom,RAN,Core Network', deadline: new Date('2025-07-31') },

    // 6. Flipkart
    { companyIdx: 5, title: 'Backend Engineer - Payments', description: '## About the Role\n\nFlipkart\'s Payments team is hiring Backend Engineers to build India\'s most reliable payment infrastructure.\n\n## Responsibilities\n- Design and develop high-throughput payment processing systems\n- Build APIs handling millions of transactions per day\n- Ensure PCI DSS compliance and payment security\n- Optimize system latency and reliability\n\n## Requirements\n- 3+ years of backend development experience\n- Proficiency in Java or Go\n- Experience with distributed systems and message queues (Kafka)\n- Understanding of payment protocols (UPI, cards, wallets)', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 2000000, salaryMax: 3500000, remote: false, skills: 'Java,Go,Kafka,Distributed Systems,Payments,MySQL', deadline: new Date('2025-08-10') },

    // 7. Zoho
    { companyIdx: 6, title: 'Product Engineer - Zoho CRM', description: '## About the Role\n\nJoin Zoho to build features for Zoho CRM, trusted by 250,000+ businesses worldwide.\n\n## Responsibilities\n- Design and develop new CRM features end-to-end\n- Build scalable backend services in Java\n- Create intuitive frontend experiences\n- Write comprehensive unit and integration tests\n\n## Requirements\n- 2+ years of product development experience\n- Strong Java and JavaScript skills\n- Interest in CRM/SaaS product development\n- B.Tech/B.E. from a reputed university\n\n## Perks\n- Work from Zoho\'s beautiful Tenkasi campus\n- Free meals and accommodation support', type: 'FULL_TIME', location: 'Chennai, Tamil Nadu', salaryMin: 800000, salaryMax: 1500000, remote: false, skills: 'Java,JavaScript,SaaS,CRM,SQL,Product Development', deadline: new Date('2025-09-15') },

    // 8. Freshworks
    { companyIdx: 7, title: 'Site Reliability Engineer (SRE)', description: '## About the Role\n\nFreshworks is looking for SREs to ensure our cloud platform maintains 99.99% uptime for global customers.\n\n## Responsibilities\n- Build and maintain CI/CD pipelines and deployment automation\n- Monitor system health and drive incident response\n- Implement infrastructure as code using Terraform\n- Optimize cloud costs and resource utilization\n\n## Requirements\n- 3+ years in SRE/DevOps roles\n- Experience with AWS, Kubernetes, and Docker\n- Proficiency in Python or Go for automation\n- Knowledge of monitoring tools (Datadog, Prometheus, Grafana)', type: 'FULL_TIME', location: 'Chennai, Tamil Nadu', salaryMin: 1800000, salaryMax: 3000000, remote: true, skills: 'AWS,Kubernetes,Docker,Terraform,Python,Prometheus,Go', deadline: new Date('2025-08-25') },

    // 9. Razorpay
    { companyIdx: 8, title: 'Frontend Engineer - Dashboard', description: '## About the Role\n\nRazorpay is hiring Frontend Engineers to build our merchant dashboard used by 10M+ businesses.\n\n## Responsibilities\n- Build complex data visualizations and real-time dashboards\n- Develop reusable component libraries with React\n- Optimize performance for large-scale data rendering\n- Collaborate closely with product and design teams\n\n## Requirements\n- 2+ years of frontend development experience\n- Expert in React, TypeScript, and modern CSS\n- Experience with data visualization (D3.js, Recharts)\n- Understanding of fintech domain is a plus', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 1500000, salaryMax: 2800000, remote: true, skills: 'React,TypeScript,CSS,D3.js,Recharts,Performance Optimization', deadline: new Date('2025-08-05') },

    // 10. PhonePe
    { companyIdx: 9, title: 'Android Developer - UPI', description: '## About the Role\n\nPhonePe is looking for Android Developers to build features for India\'s most used UPI app with 500M+ users.\n\n## Responsibilities\n- Develop and maintain the PhonePe Android application\n- Build smooth, performant UI with Jetpack Compose\n- Implement secure payment flows and biometric authentication\n- Optimize app size, startup time, and battery usage\n\n## Requirements\n- 3+ years of Android development (Kotlin)\n- Experience with Jetpack Compose and MVVM architecture\n- Knowledge of security best practices for financial apps\n- Understanding of UPI and payment ecosystems', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 2000000, salaryMax: 3500000, remote: false, skills: 'Android,Kotlin,Jetpack Compose,MVVM,UPI,Security', deadline: new Date('2025-07-28') },

    // 11. CRED
    { companyIdx: 10, title: 'iOS Developer', description: '## About the Role\n\nCRED is hiring iOS Developers to craft delightful experiences for India\'s most creditworthy community.\n\n## Responsibilities\n- Build elegant, pixel-perfect iOS interfaces using SwiftUI\n- Implement complex animations and micro-interactions\n- Architect scalable, testable iOS codebases\n- Work with backend teams on API design\n\n## Requirements\n- 3+ years of iOS development (Swift)\n- Strong SwiftUI and UIKit experience\n- Passion for beautiful design and attention to detail\n- Experience with Core Animation and custom transitions\n\n## Why CRED?\n- Work on an app loved by millions\n- Industry-best compensation and ESOPs', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 2500000, salaryMax: 4500000, remote: false, skills: 'iOS,Swift,SwiftUI,UIKit,Core Animation,Architecture', deadline: new Date('2025-08-12') },

    // 12. Swiggy
    { companyIdx: 11, title: 'Data Scientist - Delivery Optimization', description: '## About the Role\n\nSwiggy is hiring Data Scientists to optimize delivery routes and ETAs for millions of daily orders.\n\n## Responsibilities\n- Build ML models for delivery time prediction and route optimization\n- Analyze large-scale geospatial and temporal data\n- Design A/B experiments to validate model improvements\n- Collaborate with logistics and operations teams\n\n## Requirements\n- 2+ years in data science/ML roles\n- Strong Python, Pandas, and Scikit-learn skills\n- Experience with geospatial analysis and optimization\n- M.Tech/M.S. in CS, Statistics, or related field preferred', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 1800000, salaryMax: 3200000, remote: false, skills: 'Python,Machine Learning,Pandas,Scikit-learn,Geospatial,A/B Testing', deadline: new Date('2025-09-10') },

    // 13. Zomato
    { companyIdx: 12, title: 'Product Manager - Restaurant Partner App', description: '## About the Role\n\nZomato is looking for a Product Manager to own the Restaurant Partner experience serving 200K+ partner restaurants.\n\n## Responsibilities\n- Define product strategy and roadmap for the restaurant app\n- Analyze user data to identify pain points and opportunities\n- Write PRDs and work with engineering to ship features\n- Drive OKRs and measure impact through metrics\n\n## Requirements\n- 3+ years of product management experience\n- Strong analytical skills (SQL, data analysis)\n- Experience with B2B or marketplace products\n- MBA from a top-tier institute preferred\n- Passion for food and technology', type: 'FULL_TIME', location: 'Gurugram, Haryana', salaryMin: 2500000, salaryMax: 4000000, remote: false, skills: 'Product Management,SQL,Data Analysis,PRD,Agile,B2B', deadline: new Date('2025-08-18') },

    // 14. Ola Electric
    { companyIdx: 13, title: 'Embedded Systems Engineer', description: '## About the Role\n\nOla Electric is hiring Embedded Engineers to build the software for India\'s most advanced electric scooters.\n\n## Responsibilities\n- Develop firmware for vehicle control units (VCU)\n- Implement battery management system (BMS) algorithms\n- Debug hardware-software integration issues\n- Write safety-critical embedded code in C/C++\n\n## Requirements\n- 3+ years in embedded systems development\n- Strong C/C++ programming for microcontrollers\n- Experience with CAN bus, SPI, I2C protocols\n- Knowledge of automotive standards (ISO 26262) is a plus\n- B.Tech in ECE/EEE from a reputed college', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 1500000, salaryMax: 2800000, remote: false, skills: 'Embedded C,C++,Microcontrollers,CAN Bus,BMS,Firmware', deadline: new Date('2025-08-30') },

    // 15. Dream11
    { companyIdx: 14, title: 'Backend Engineer - High Scale Systems', description: '## About the Role\n\nDream11 needs Backend Engineers to handle massive traffic spikes during live cricket matches — 50M+ concurrent users.\n\n## Responsibilities\n- Build and scale backend services handling 1M+ requests/second\n- Design fault-tolerant distributed systems\n- Implement real-time scoring and leaderboard engines\n- Optimize database queries and caching strategies\n\n## Requirements\n- 3+ years backend experience with high-scale systems\n- Proficiency in Go, Java, or Python\n- Experience with Redis, Kafka, and distributed databases\n- Passion for sports and competitive programming background is a plus', type: 'FULL_TIME', location: 'Mumbai, Maharashtra', salaryMin: 2500000, salaryMax: 4500000, remote: false, skills: 'Go,Java,Redis,Kafka,Distributed Systems,High Scale', deadline: new Date('2025-07-25') },

    // 16. Byju's
    { companyIdx: 15, title: 'Content & Curriculum Developer', description: '## About the Role\n\nBYJU\'S is looking for Content Developers to create engaging learning experiences for Class 6-12 students.\n\n## Responsibilities\n- Design interactive math and science content modules\n- Create animated video scripts and assessments\n- Analyze student learning outcomes to improve content\n- Collaborate with animators and video production teams\n\n## Requirements\n- 2+ years in education or content development\n- Strong command of CBSE/ICSE curriculum (Math/Science)\n- Excellent writing and storytelling skills\n- B.Ed or teaching experience preferred\n- Passion for making education accessible', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 600000, salaryMax: 1200000, remote: true, skills: 'Content Development,Curriculum Design,Education,Writing,CBSE,Assessment', deadline: new Date('2025-09-20') },

    // 17. Meesho
    { companyIdx: 16, title: 'Machine Learning Engineer - Recommendations', description: '## About the Role\n\nMeesho is hiring ML Engineers to build personalized product recommendation systems for 150M+ users.\n\n## Responsibilities\n- Build and deploy recommendation models at scale\n- Design feature engineering pipelines for e-commerce data\n- Implement real-time inference systems using TensorFlow Serving\n- Run and analyze A/B experiments for model evaluation\n\n## Requirements\n- 2+ years in ML engineering roles\n- Strong Python, TensorFlow/PyTorch experience\n- Experience with recommendation systems or NLP\n- Knowledge of MLOps and model serving infrastructure\n- M.Tech/MS in CS or related field', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 2000000, salaryMax: 3500000, remote: false, skills: 'Python,TensorFlow,PyTorch,Recommendation Systems,MLOps,Feature Engineering', deadline: new Date('2025-08-08') },

    // 18. Zerodha
    { companyIdx: 17, title: 'Full Stack Developer (Elixir + React)', description: '## About the Role\n\nZerodha is hiring developers for our trading platform Kite, used by 15M+ investors daily.\n\n## Responsibilities\n- Build real-time trading features using Elixir and React\n- Develop WebSocket-based live market data streaming\n- Optimize for sub-millisecond latency in order execution\n- Write clean, well-tested code with high reliability\n\n## Requirements\n- 2+ years of web development experience\n- Experience with Elixir/Erlang or willingness to learn\n- Strong React and JavaScript/TypeScript skills\n- Understanding of financial markets and trading systems\n- Passion for building developer-friendly tools\n\n## Note\nZerodha has a flat hierarchy, no meetings culture, and fully remote work.', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 1500000, salaryMax: 3000000, remote: true, skills: 'Elixir,React,TypeScript,WebSocket,Trading Systems,PostgreSQL', deadline: new Date('2025-09-05') },

    // 19. Postman
    { companyIdx: 18, title: 'Developer Advocate', description: '## About the Role\n\nPostman is looking for Developer Advocates to grow our API-first community of 30M+ developers globally.\n\n## Responsibilities\n- Create technical content: blogs, videos, tutorials, and talks\n- Represent Postman at developer conferences in India and globally\n- Build sample projects and API collections\n- Gather developer feedback to influence product roadmap\n\n## Requirements\n- 2+ years in developer relations or software engineering\n- Excellent public speaking and technical writing skills\n- Deep understanding of APIs, REST, GraphQL, and gRPC\n- Active presence in developer communities\n- Experience with content creation (YouTube, blogs, podcasts)', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 1800000, salaryMax: 3000000, remote: true, skills: 'APIs,REST,GraphQL,Technical Writing,Public Speaking,Developer Relations', deadline: new Date('2025-08-22') },

    // 20. Groww
    { companyIdx: 19, title: 'Security Engineer', description: '## About the Role\n\nGroww is hiring Security Engineers to protect financial data of 10 Cr+ investors on our platform.\n\n## Responsibilities\n- Conduct security assessments and penetration testing\n- Build and maintain security monitoring and alerting systems\n- Implement zero-trust security architecture\n- Drive compliance with RBI, SEBI, and SOC2 requirements\n\n## Requirements\n- 3+ years in application or infrastructure security\n- Experience with OWASP, SAST/DAST tools, and WAF\n- Knowledge of cloud security (AWS/GCP)\n- OSCP, CEH, or equivalent certification preferred\n- Understanding of financial regulations', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 2000000, salaryMax: 3500000, remote: false, skills: 'Security,Penetration Testing,OWASP,AWS Security,SOC2,Cloud Security', deadline: new Date('2025-09-12') },

    // 21. Lenskart
    { companyIdx: 20, title: 'Computer Vision Engineer', description: '## About the Role\n\nLenskart is hiring Computer Vision Engineers to power our virtual try-on and face measurement technology.\n\n## Responsibilities\n- Develop ML models for face detection and 3D face mesh estimation\n- Build real-time AR try-on experiences for mobile and web\n- Optimize models for edge deployment on mobile devices\n- Research and implement latest CV papers\n\n## Requirements\n- 2+ years in computer vision or deep learning\n- Strong Python, PyTorch, and OpenCV skills\n- Experience with face detection/recognition systems\n- Knowledge of 3D reconstruction and AR\n- Published research or Kaggle experience is a plus', type: 'FULL_TIME', location: 'Gurugram, Haryana', salaryMin: 1800000, salaryMax: 3200000, remote: false, skills: 'Computer Vision,PyTorch,OpenCV,Deep Learning,AR,3D Reconstruction', deadline: new Date('2025-08-28') },

    // 22. Paytm
    { companyIdx: 21, title: 'QA Automation Engineer', description: '## About the Role\n\nPaytm is hiring QA Automation Engineers to ensure quality across our financial services ecosystem.\n\n## Responsibilities\n- Design and develop automated test frameworks\n- Write API, UI, and integration test suites\n- Set up CI/CD test pipelines with Jenkins\n- Perform load and performance testing for payment systems\n\n## Requirements\n- 2+ years in test automation\n- Proficiency in Selenium, Appium, and REST Assured\n- Experience with Java/Python for test scripting\n- Knowledge of performance testing tools (JMeter, Gatling)\n- Understanding of payment systems and compliance testing', type: 'FULL_TIME', location: 'Noida, Uttar Pradesh', salaryMin: 1000000, salaryMax: 1800000, remote: false, skills: 'Selenium,Appium,REST Assured,Java,JMeter,CI/CD,Test Automation', deadline: new Date('2025-08-15') },

    // 23. Nykaa
    { companyIdx: 22, title: 'UI/UX Designer - E-Commerce', description: '## About the Role\n\nNykaa is looking for UI/UX Designers to craft beautiful shopping experiences for millions of beauty enthusiasts.\n\n## Responsibilities\n- Design end-to-end user flows for web and mobile apps\n- Create wireframes, prototypes, and high-fidelity designs in Figma\n- Conduct user research and usability testing\n- Build and maintain Nykaa\'s design system\n\n## Requirements\n- 3+ years of UI/UX design experience\n- Strong Figma portfolio showcasing e-commerce or consumer apps\n- Understanding of accessibility and mobile-first design\n- Knowledge of motion design and micro-interactions\n- Fashion or beauty industry experience is a bonus', type: 'FULL_TIME', location: 'Mumbai, Maharashtra', salaryMin: 1200000, salaryMax: 2200000, remote: false, skills: 'Figma,UI/UX,User Research,Design Systems,Prototyping,Mobile Design', deadline: new Date('2025-09-01') },

    // 24. upGrad
    { companyIdx: 23, title: 'Technical Program Manager', description: '## About the Role\n\nupGrad is hiring a Technical Program Manager to drive execution of our learning platform engineering roadmap.\n\n## Responsibilities\n- Manage cross-functional engineering programs across multiple teams\n- Define program timelines, milestones, and dependencies\n- Drive technical decision-making and risk mitigation\n- Report program status to VP Engineering and CTO\n\n## Requirements\n- 5+ years in software engineering, 2+ in program management\n- Experience managing programs in EdTech or SaaS companies\n- Strong understanding of Agile, Scrum, and project management tools\n- PMP or CSM certification is a plus\n- Excellent stakeholder communication skills', type: 'FULL_TIME', location: 'Mumbai, Maharashtra', salaryMin: 2500000, salaryMax: 4000000, remote: true, skills: 'Program Management,Agile,Scrum,JIRA,Stakeholder Management,Technical Planning', deadline: new Date('2025-08-20') },

    // 25. ShareChat
    { companyIdx: 24, title: 'NLP Engineer - Content Moderation', description: '## About the Role\n\nShareChat is hiring NLP Engineers to build AI-powered content moderation for 15 Indian languages.\n\n## Responsibilities\n- Build multilingual NLP models for toxic content detection\n- Develop language-specific classifiers for Hindi, Tamil, Telugu, and more\n- Create datasets and annotation pipelines for Indian languages\n- Deploy models for real-time content moderation at scale\n\n## Requirements\n- 2+ years in NLP/ML engineering\n- Experience with multilingual NLP and transformers (mBERT, XLM-R)\n- Strong Python, PyTorch, and Hugging Face skills\n- Knowledge of Indian languages is a strong advantage\n- M.Tech/MS in CS, Computational Linguistics, or related field', type: 'FULL_TIME', location: 'Bengaluru, Karnataka', salaryMin: 2000000, salaryMax: 3500000, remote: false, skills: 'NLP,PyTorch,Transformers,Multilingual NLP,Content Moderation,Hugging Face', deadline: new Date('2025-09-15') },
  ];

  let jobCount = 0;
  for (const job of jobPostings) {
    const company = createdCompanies[job.companyIdx];
    await prisma.job.create({
      data: {
        title: job.title,
        description: job.description,
        companyId: company.id,
        recruiterId: recruiter.id,
        type: job.type,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        remote: job.remote,
        skills: job.skills,
        status: 'ACTIVE',
        deadline: job.deadline,
      },
    });
    jobCount++;
    console.log(`  📌 [${jobCount}/25] ${job.title} @ ${company.name}`);
  }

  console.log(`\n🎉 Successfully seeded ${jobCount} Indian company job postings!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
