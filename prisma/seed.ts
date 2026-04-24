import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { hash } from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url: dbUrl, ...(authToken ? { authToken } : {}) });
const prisma = new PrismaClient({ adapter } as any);


async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jobportal.com' },
    update: {},
    create: {
      email: 'admin@jobportal.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      bio: 'Platform administrator',
      location: 'San Francisco, CA',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Recruiter
  const recruiterPassword = await hash('recruiter123', 12);
  const recruiter1 = await prisma.user.upsert({
    where: { email: 'sarah@techcorp.com' },
    update: {},
    create: {
      email: 'sarah@techcorp.com',
      password: recruiterPassword,
      name: 'Sarah Johnson',
      role: 'RECRUITER',
      bio: 'Head of Talent Acquisition at TechCorp. Passionate about building great teams.',
      location: 'San Francisco, CA',
      phone: '+1-555-0101',
    },
  });

  const recruiter2 = await prisma.user.upsert({
    where: { email: 'mike@designstudio.com' },
    update: {},
    create: {
      email: 'mike@designstudio.com',
      password: recruiterPassword,
      name: 'Mike Chen',
      role: 'RECRUITER',
      bio: 'Co-founder & CEO at DesignStudio. We create beautiful digital experiences.',
      location: 'New York, NY',
      phone: '+1-555-0102',
    },
  });

  // Create Jobseekers
  const seekerPassword = await hash('seeker123', 12);
  const seeker1 = await prisma.user.upsert({
    where: { email: 'alex@gmail.com' },
    update: {},
    create: {
      email: 'alex@gmail.com',
      password: seekerPassword,
      name: 'Alex Rivera',
      role: 'JOBSEEKER',
      bio: 'Full-stack developer with 3 years of experience. Love building products that make a difference.',
      location: 'Austin, TX',
      phone: '+1-555-0201',
      jobseekerProfile: {
        create: {
          headline: 'Full-Stack Developer | React & Node.js',
          skills: 'JavaScript,TypeScript,React,Node.js,PostgreSQL,Docker,AWS',
          experience: JSON.stringify([
            { title: 'Software Engineer', company: 'StartupXYZ', duration: '2023-Present', description: 'Building scalable web applications' },
            { title: 'Junior Developer', company: 'WebAgency', duration: '2021-2023', description: 'Frontend development with React' },
          ]),
          education: JSON.stringify([
            { degree: 'B.S. Computer Science', school: 'UT Austin', year: '2021' },
          ]),
          portfolioUrl: 'https://alexrivera.dev',
        },
      },
    },
  });

  const seeker2 = await prisma.user.upsert({
    where: { email: 'emma@gmail.com' },
    update: {},
    create: {
      email: 'emma@gmail.com',
      password: seekerPassword,
      name: 'Emma Wilson',
      role: 'JOBSEEKER',
      bio: 'UX Designer specializing in user research and design systems. Currently exploring new opportunities.',
      location: 'Seattle, WA',
      phone: '+1-555-0202',
      jobseekerProfile: {
        create: {
          headline: 'UX Designer | Design Systems & User Research',
          skills: 'Figma,Sketch,Adobe XD,User Research,Prototyping,Design Systems,CSS',
          experience: JSON.stringify([
            { title: 'Senior UX Designer', company: 'BigTech Inc', duration: '2022-Present', description: 'Leading design system initiatives' },
            { title: 'UX Designer', company: 'DesignCo', duration: '2020-2022', description: 'User research and interface design' },
          ]),
          education: JSON.stringify([
            { degree: 'M.A. Interaction Design', school: 'SCAD', year: '2020' },
            { degree: 'B.F.A. Graphic Design', school: 'RISD', year: '2018' },
          ]),
          portfolioUrl: 'https://emmawilson.design',
        },
      },
    },
  });

  const seeker3 = await prisma.user.upsert({
    where: { email: 'james@gmail.com' },
    update: {},
    create: {
      email: 'james@gmail.com',
      password: seekerPassword,
      name: 'James Park',
      role: 'JOBSEEKER',
      bio: 'Data scientist passionate about ML and AI. Looking for challenging roles in AI-first companies.',
      location: 'Boston, MA',
      phone: '+1-555-0203',
      jobseekerProfile: {
        create: {
          headline: 'Data Scientist | Machine Learning & AI',
          skills: 'Python,TensorFlow,PyTorch,SQL,Spark,AWS,Tableau,R',
          experience: JSON.stringify([
            { title: 'Data Scientist', company: 'DataDriven Inc', duration: '2022-Present', description: 'Building ML models for recommendation systems' },
          ]),
          education: JSON.stringify([
            { degree: 'M.S. Data Science', school: 'MIT', year: '2022' },
            { degree: 'B.S. Statistics', school: 'UCLA', year: '2020' },
          ]),
        },
      },
    },
  });

  // Create Companies
  const company1 = await prisma.company.upsert({
    where: { id: 'techcorp-id' },
    update: {},
    create: {
      id: 'techcorp-id',
      name: 'TechCorp',
      description: 'TechCorp is a leading technology company building next-generation cloud infrastructure and developer tools. We believe in empowering developers to build amazing products.',
      website: 'https://techcorp.example.com',
      location: 'San Francisco, CA',
      industry: 'Technology',
      size: '201-500',
      foundedYear: 2015,
      recruiterId: recruiter1.id,
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: 'designstudio-id' },
    update: {},
    create: {
      id: 'designstudio-id',
      name: 'DesignStudio',
      description: 'DesignStudio is a boutique design agency crafting beautiful digital experiences for startups and enterprises alike. We combine strategy, design, and technology.',
      website: 'https://designstudio.example.com',
      location: 'New York, NY',
      industry: 'Design',
      size: '11-50',
      foundedYear: 2018,
      recruiterId: recruiter2.id,
    },
  });

  const company3 = await prisma.company.upsert({
    where: { id: 'aiventure-id' },
    update: {},
    create: {
      id: 'aiventure-id',
      name: 'AI Venture Labs',
      description: 'AI Venture Labs is an AI research lab building cutting-edge solutions in natural language processing, computer vision, and reinforcement learning.',
      website: 'https://aiventurelabs.example.com',
      location: 'Boston, MA',
      industry: 'Artificial Intelligence',
      size: '51-200',
      foundedYear: 2019,
      recruiterId: recruiter1.id,
    },
  });

  // Create Jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Full-Stack Engineer',
        description: `## About the Role\n\nWe're looking for a Senior Full-Stack Engineer to join our platform team. You'll be working on our core product, building new features and improving existing ones.\n\n## Responsibilities\n- Design and implement scalable backend services\n- Build responsive and accessible frontend interfaces\n- Mentor junior developers\n- Participate in code reviews and architectural discussions\n\n## Requirements\n- 5+ years of experience with JavaScript/TypeScript\n- Strong experience with React and Node.js\n- Experience with SQL databases\n- Familiarity with cloud services (AWS/GCP)\n\n## Nice to Have\n- Experience with GraphQL\n- Contributions to open-source projects\n- Experience with microservices architecture`,
        companyId: company1.id,
        recruiterId: recruiter1.id,
        type: 'FULL_TIME',
        location: 'San Francisco, CA',
        salaryMin: 150000,
        salaryMax: 200000,
        remote: true,
        skills: 'JavaScript,TypeScript,React,Node.js,PostgreSQL,AWS',
        status: 'ACTIVE',
        deadline: new Date('2025-06-30'),
      },
    }),
    prisma.job.create({
      data: {
        title: 'UX/UI Designer',
        description: `## About the Role\n\nJoin DesignStudio as our next UX/UI Designer. You'll work directly with clients to create beautiful, user-centered designs.\n\n## Responsibilities\n- Conduct user research and usability testing\n- Create wireframes, prototypes, and high-fidelity designs\n- Maintain and evolve our design system\n- Collaborate with developers for implementation\n\n## Requirements\n- 3+ years of UX/UI design experience\n- Proficiency in Figma\n- Strong portfolio showcasing user-centered design\n- Understanding of accessibility standards`,
        companyId: company2.id,
        recruiterId: recruiter2.id,
        type: 'FULL_TIME',
        location: 'New York, NY',
        salaryMin: 100000,
        salaryMax: 140000,
        remote: false,
        skills: 'Figma,User Research,Prototyping,Design Systems,CSS',
        status: 'ACTIVE',
        deadline: new Date('2025-07-15'),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Machine Learning Engineer',
        description: `## About the Role\n\nAI Venture Labs is looking for a Machine Learning Engineer to join our NLP team. You'll be working on state-of-the-art language models.\n\n## Responsibilities\n- Develop and train ML models for NLP tasks\n- Optimize model performance and inference speed\n- Build data pipelines for model training\n- Collaborate with research scientists\n\n## Requirements\n- M.S. or Ph.D. in CS, ML, or related field\n- Strong experience with PyTorch or TensorFlow\n- Published research in ML/NLP is a plus\n- Experience with distributed training`,
        companyId: company3.id,
        recruiterId: recruiter1.id,
        type: 'FULL_TIME',
        location: 'Boston, MA',
        salaryMin: 160000,
        salaryMax: 220000,
        remote: true,
        skills: 'Python,PyTorch,TensorFlow,NLP,Machine Learning',
        status: 'ACTIVE',
        deadline: new Date('2025-08-01'),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Frontend Developer Intern',
        description: `## About the Role\n\nGreat opportunity for aspiring frontend developers to gain hands-on experience at TechCorp.\n\n## Responsibilities\n- Build UI components using React\n- Fix bugs and improve performance\n- Write unit tests\n- Participate in sprint planning\n\n## Requirements\n- Currently pursuing CS degree\n- Familiarity with HTML, CSS, JavaScript\n- Basic knowledge of React\n- Eagerness to learn`,
        companyId: company1.id,
        recruiterId: recruiter1.id,
        type: 'INTERNSHIP',
        location: 'San Francisco, CA',
        salaryMin: 30,
        salaryMax: 45,
        remote: true,
        skills: 'HTML,CSS,JavaScript,React',
        status: 'ACTIVE',
        deadline: new Date('2025-05-30'),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Product Designer',
        description: `## About the Role\n\nDesignStudio is looking for a Product Designer to work on high-impact client projects.\n\n## Responsibilities\n- Lead end-to-end design for client projects\n- Conduct design sprints and workshops\n- Create interactive prototypes\n- Present designs to stakeholders\n\n## Requirements\n- 5+ years of product design experience\n- Experience with design sprints\n- Strong communication skills\n- Agency experience preferred`,
        companyId: company2.id,
        recruiterId: recruiter2.id,
        type: 'CONTRACT',
        location: 'Remote',
        salaryMin: 120000,
        salaryMax: 160000,
        remote: true,
        skills: 'Product Design,Figma,Design Sprints,Prototyping',
        status: 'ACTIVE',
      },
    }),
    prisma.job.create({
      data: {
        title: 'DevOps Engineer',
        description: `## About the Role\n\nJoin our infrastructure team to build and maintain our cloud platform.\n\n## Responsibilities\n- Manage CI/CD pipelines\n- Monitor and improve system reliability\n- Implement infrastructure as code\n- On-call rotation\n\n## Requirements\n- 3+ years of DevOps experience\n- Strong knowledge of AWS or GCP\n- Experience with Kubernetes and Docker\n- Terraform or Pulumi experience`,
        companyId: company1.id,
        recruiterId: recruiter1.id,
        type: 'FULL_TIME',
        location: 'San Francisco, CA',
        salaryMin: 140000,
        salaryMax: 180000,
        remote: true,
        skills: 'AWS,Kubernetes,Docker,Terraform,CI/CD',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`✅ Created ${jobs.length} jobs`);

  // Create sample applications
  await prisma.application.create({
    data: {
      jobId: jobs[0].id,
      userId: seeker1.id,
      coverLetter: 'I am extremely interested in this position. With my 3 years of full-stack experience and passion for building scalable applications, I believe I would be a great fit for the TechCorp team.',
      status: 'REVIEWED',
    },
  });

  await prisma.application.create({
    data: {
      jobId: jobs[1].id,
      userId: seeker2.id,
      coverLetter: 'As a UX Designer with 4+ years of experience in design systems and user research, I would love to bring my expertise to DesignStudio.',
      status: 'SHORTLISTED',
    },
  });

  await prisma.application.create({
    data: {
      jobId: jobs[2].id,
      userId: seeker3.id,
      coverLetter: 'With my M.S. in Data Science from MIT and experience building ML models, I am eager to contribute to AI Venture Labs\' NLP research.',
      status: 'PENDING',
    },
  });

  console.log('✅ Sample applications created');

  // Create sample posts
  await prisma.post.create({
    data: {
      authorId: seeker1.id,
      content: '🚀 Excited to share that I just completed my AWS Solutions Architect certification! The cloud journey continues. #AWS #CloudComputing #CareerGrowth',
    },
  });

  await prisma.post.create({
    data: {
      authorId: recruiter1.id,
      content: '📢 We\'re hiring! TechCorp is looking for talented engineers to join our growing team. Check out our open positions. Great culture, competitive pay, and fully remote options available! #Hiring #TechJobs',
    },
  });

  await prisma.post.create({
    data: {
      authorId: seeker2.id,
      content: '✨ Just published my case study on designing accessible design systems. Accessibility isn\'t a feature, it\'s a responsibility. Would love to hear your thoughts! #UXDesign #Accessibility #DesignSystems',
    },
  });

  await prisma.post.create({
    data: {
      authorId: recruiter2.id,
      content: '🎨 DesignStudio just wrapped up an incredible project with a Fortune 500 client. So proud of our team! Looking for talented designers to join us for our next chapter. #Design #Agency #Hiring',
    },
  });

  await prisma.post.create({
    data: {
      authorId: seeker3.id,
      content: '🤖 Just wrapped up training a transformer model that outperforms the baseline by 15%. The key was a novel attention mechanism. Paper draft coming soon! #MachineLearning #AI #NLP',
    },
  });

  console.log('✅ Sample posts created');

  // Create a sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: recruiter1.id },
          { userId: seeker1.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: recruiter1.id,
            content: 'Hi Alex! I reviewed your application for the Senior Full-Stack Engineer position. Your profile looks impressive!',
            read: true,
          },
          {
            senderId: seeker1.id,
            content: 'Thank you, Sarah! I\'m really excited about the opportunity at TechCorp. The tech stack and team culture seem like a great fit.',
            read: true,
          },
          {
            senderId: recruiter1.id,
            content: 'Would you be available for a technical interview next week? We\'d love to chat more about your experience.',
            read: false,
          },
        ],
      },
    },
  });

  console.log('✅ Sample conversation created');

  // Create saved jobs
  await prisma.savedJob.create({
    data: {
      userId: seeker1.id,
      jobId: jobs[2].id,
    },
  });

  await prisma.savedJob.create({
    data: {
      userId: seeker2.id,
      jobId: jobs[4].id,
    },
  });

  console.log('✅ Saved jobs created');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: seeker1.id,
        type: 'APPLICATION',
        title: 'Application Reviewed',
        message: 'Your application for Senior Full-Stack Engineer at TechCorp has been reviewed.',
        link: '/applications',
      },
      {
        userId: seeker2.id,
        type: 'APPLICATION',
        title: 'Shortlisted!',
        message: 'Great news! You\'ve been shortlisted for UX/UI Designer at DesignStudio.',
        link: '/applications',
      },
      {
        userId: recruiter1.id,
        type: 'APPLICATION',
        title: 'New Application',
        message: 'James Park applied for Machine Learning Engineer position.',
        link: '/my-jobs',
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
