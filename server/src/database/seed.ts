import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { initDatabase } from './initDb.js';

export async function seedDatabase() {
  console.log('🌱 Seeding Eventra Database with realistic campus data...');

  // Ensure DB and schema are ready
  await initDatabase();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Clean existing tables in reverse dependency order
    console.log('🧹 Cleaning existing records...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE audit_logs;');
    await connection.query('TRUNCATE TABLE event_history;');
    await connection.query('TRUNCATE TABLE reminders;');
    await connection.query('TRUNCATE TABLE notifications;');
    await connection.query('TRUNCATE TABLE bookmarks;');
    await connection.query('TRUNCATE TABLE applications;');
    await connection.query('TRUNCATE TABLE events;');
    await connection.query('TRUNCATE TABLE student_profiles;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    const passwordHash = await bcrypt.hash('Password@123', 10);

    // 1. Insert Users
    console.log('👥 Inserting Users (Students, Teachers, Edu Cell / SAC)...');

    // Teachers (3+)
    const teachersData = [
      { name: 'Prof. Ravi Kumar', email: 'prof.ravi.kumar@campus.edu', role: 'TEACHER' },
      { name: 'Prof. Sunita Sharma', email: 'prof.sunita.sharma@campus.edu', role: 'TEACHER' },
      { name: 'Prof. Arun Deshmukh', email: 'prof.arun.deshmukh@campus.edu', role: 'TEACHER' },
    ];

    const teacherIds: number[] = [];
    for (const t of teachersData) {
      const [res] = await connection.query<any>(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        [t.name, t.email, passwordHash, t.role]
      );
      teacherIds.push(res.insertId);
    }

    // Edu Cell / SAC (2+)
    const educellData = [
      { name: 'SAC Coordinator', email: 'sac.coordinator@campus.edu', role: 'EDUCELL' },
      { name: 'Edu Cell Convener', email: 'educell.lead@campus.edu', role: 'EDUCELL' },
    ];

    const educellIds: number[] = [];
    for (const e of educellData) {
      const [res] = await connection.query<any>(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        [e.name, e.email, passwordHash, e.role]
      );
      educellIds.push(res.insertId);
    }

    // Students (5+)
    const studentsData = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@campus.edu',
        role: 'STUDENT',
        roll_number: '21CS001',
        department: 'Computer Science & Engineering',
        section: 'A',
        phone_number: '9876543210',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'C++', 'Data Structures'],
        interests: ['Artificial Intelligence', 'Hackathons', 'Competitive Programming', 'Research'],
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@campus.edu',
        role: 'STUDENT',
        roll_number: '21IT045',
        department: 'Information Technology',
        section: 'B',
        phone_number: '9812345678',
        skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'Docker', 'AWS'],
        interests: ['Web Development', 'Cloud Computing', 'Open Source', 'UI/UX Design'],
      },
      {
        name: 'Rohit Verma',
        email: 'rohit.verma@campus.edu',
        role: 'STUDENT',
        roll_number: '22EC012',
        department: 'Electronics & Communication',
        section: 'A',
        phone_number: '9765432109',
        skills: ['Embedded Systems', 'IoT', 'Arduino', 'Python', 'MATLAB', 'VLSI'],
        interests: ['Robotics', 'Hardware', 'Cultural Events', 'Photography'],
      },
      {
        name: 'Ananya Singh',
        email: 'ananya.singh@campus.edu',
        role: 'STUDENT',
        roll_number: '22ME034',
        department: 'Mechanical Engineering',
        section: 'C',
        phone_number: '9654321098',
        skills: ['AutoCAD', 'SolidWorks', 'ANSYS', '3D Printing', 'Project Management'],
        interests: ['Electric Vehicles', 'Automotive', 'Badminton', 'Debate'],
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram.reddy@campus.edu',
        role: 'STUDENT',
        roll_number: '23MB008',
        department: 'Management Studies (MBA)',
        section: 'A',
        phone_number: '9543210987',
        skills: ['Financial Modeling', 'Market Research', 'Pitching', 'Leadership', 'Excel'],
        interests: ['Entrepreneurship', 'Venture Capital', 'Placement Drives', 'Case Competitions'],
      },
    ];

    const studentUserIds: number[] = [];
    for (const s of studentsData) {
      const [uRes] = await connection.query<any>(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'STUDENT')`,
        [s.name, s.email, passwordHash]
      );
      const sUserId = uRes.insertId;
      studentUserIds.push(sUserId);

      await connection.query(
        `INSERT INTO student_profiles (user_id, roll_number, department, section, phone_number, skills, interests)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sUserId,
          s.roll_number,
          s.department,
          s.section,
          s.phone_number,
          JSON.stringify(s.skills),
          JSON.stringify(s.interests),
        ]
      );
    }

    // 2. Insert Events (10+ comprehensive campus events)
    console.log('🎪 Inserting 10+ Diverse Campus Events...');

    const eventsData = [
      {
        title: 'National AI & ML Hackathon 2026',
        description:
          'Join over 300+ students in an intensive 36-hour hackathon solving real-world AI challenges in healthcare, fintech, and climate tech. Mentored by top industry researchers with cash prizes over Rs. 1,50,000.',
        category: 'Hackathon',
        event_date: '2026-09-18',
        start_time: '09:00:00',
        end_time: '21:00:00',
        location: 'Innovation Lab & Seminar Complex, Tech Tower',
        organizer_name: 'Prof. Ravi Kumar',
        organizer_phone: '9845012345',
        registration_start: '2026-08-15 00:00:00',
        registration_deadline: '2026-09-15 23:59:59',
        capacity: 150,
        eligibility: 'Open to 2nd, 3rd, and 4th year Engineering students',
        target_department: 'Computer Science, IT, Electronics & All Tech',
        required_skills: ['Python', 'Machine Learning', 'TensorFlow', 'Deep Learning'],
        relevant_interests: ['Artificial Intelligence', 'Hackathons', 'Machine Learning'],
        poster_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Bring your laptop, charger, student ID card, and enthusiasm. Teams of 2 to 4 members allowed.',
        prize_info: '1st Prize: ₹75,000 | 2nd Prize: ₹45,000 | 3rd Prize: ₹25,000 + Internship Opportunities',
        certificate_info: 'Verified Certificate of Participation & Excellence for all shortlisted teams',
        created_by: teacherIds[0], // Prof Ravi Kumar
        updated_by: educellIds[0], // SAC Coordinator updated it
        status: 'UPCOMING',
      },
      {
        title: 'Full-Stack React & Node.js Production Masterclass',
        description:
          'Hands-on full day workshop building scalable web apps with Next.js, Node.js, Express, and cloud databases. Learn modern frontend tooling, security best practices, and CI/CD pipelines.',
        category: 'Workshop',
        event_date: '2026-09-12',
        start_time: '10:00:00',
        end_time: '17:00:00',
        location: 'Computer Center Lab 4, Block B',
        organizer_name: 'Prof. Ravi Kumar',
        organizer_phone: '9845012345',
        registration_start: '2026-08-20 00:00:00',
        registration_deadline: '2026-09-10 23:59:59',
        capacity: 80,
        eligibility: 'All college students with basic JavaScript knowledge',
        target_department: 'All Departments',
        required_skills: ['JavaScript', 'React', 'HTML/CSS'],
        relevant_interests: ['Web Development', 'Open Source', 'UI/UX Design'],
        poster_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Pre-install Node.js v20+ and VS Code on your laptop prior to attending the session.',
        prize_info: 'Best project demo gets ₹10,000 cloud credits and premium developer swag',
        certificate_info: 'Skill Certificate recognized by Campus Developer Club',
        created_by: teacherIds[0],
        updated_by: teacherIds[0],
        status: 'UPCOMING',
      },
      {
        title: 'Annual Campus Placement Sprint & Mock Interviews 2026',
        description:
          'Comprehensive training session featuring resume audits, technical mock interviews, and group discussion simulations conducted by senior alumni and corporate HR recruiters.',
        category: 'Placement',
        event_date: '2026-09-22',
        start_time: '09:30:00',
        end_time: '16:30:00',
        location: 'Main Auditorium & Training Center',
        organizer_name: 'Prof. Arun Deshmukh (TPO)',
        organizer_phone: '9876501234',
        registration_start: '2026-08-25 00:00:00',
        registration_deadline: '2026-09-20 23:59:59',
        capacity: 200,
        eligibility: 'Pre-final & Final Year Students (All Branches)',
        target_department: 'All Departments',
        required_skills: ['Data Structures', 'Communication', 'Problem Solving'],
        relevant_interests: ['Placement Drives', 'Career', 'Resume Building'],
        poster_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Dress in formal attire. Bring 3 hard copies of your updated resume.',
        prize_info: 'Top 20 performers receive direct fast-track placement interview passes',
        certificate_info: 'Placement Readiness Certificate',
        created_by: teacherIds[2],
        updated_by: teacherIds[2],
        status: 'UPCOMING',
      },
      {
        title: 'Cloud Computing & DevOps Summit',
        description:
          'Explore modern cloud architecture, serverless systems, Kubernetes orchestration, and AWS enterprise architectures with certified cloud solution architects.',
        category: 'Seminar',
        event_date: '2026-09-26',
        start_time: '14:00:00',
        end_time: '18:00:00',
        location: 'Mechanical Seminar Hall, Level 2',
        organizer_name: 'Prof. Sunita Sharma',
        organizer_phone: '9812304567',
        registration_start: '2026-08-28 00:00:00',
        registration_deadline: '2026-09-24 23:59:59',
        capacity: 120,
        eligibility: 'Open to all students and faculty members',
        target_department: 'Computer Science, IT, Electronics',
        required_skills: ['Linux', 'Networking', 'Cloud Basics'],
        relevant_interests: ['Cloud Computing', 'DevOps', 'Infrastructure'],
        poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Interactive Q&A and hands-on lab demonstration included.',
        prize_info: 'AWS exam voucher coupons for quiz winners',
        certificate_info: 'Digital attendance & completion certificate',
        created_by: teacherIds[1],
        updated_by: teacherIds[1],
        status: 'UPCOMING',
      },
      {
        title: 'Tarangini 2026 - Annual Campus Cultural Fest',
        description:
          'The flagship cultural extravaganza of the university! Featuring battle of the bands, classical & street dance competitions, theatre, fashion pageant, and celebrity pro-nite concert.',
        category: 'Cultural',
        event_date: '2026-10-05',
        start_time: '16:00:00',
        end_time: '22:30:00',
        location: 'University Open Air Amphitheatre & Grounds',
        organizer_name: 'SAC Coordinator',
        organizer_phone: '9845099887',
        registration_start: '2026-08-30 00:00:00',
        registration_deadline: '2026-10-02 23:59:59',
        capacity: 1000,
        eligibility: 'Open to all university students with valid student ID',
        target_department: 'All Departments',
        required_skills: ['Dance', 'Music', 'Drama', 'Creative Arts'],
        relevant_interests: ['Cultural Events', 'Music', 'Photography', 'Performance'],
        poster_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Student badge is mandatory for entry. Outside eatables and drinks not allowed.',
        prize_info: 'Total event prizes over ₹3,00,000 across all competitive tracks',
        certificate_info: 'Official SAC Cultural Merit Certificates',
        created_by: educellIds[0],
        updated_by: educellIds[0],
        status: 'UPCOMING',
      },
      {
        title: 'Campus Shark Tank & Startup Pitch Challenge',
        description:
          'Pitch your groundbreaking business concept to angel investors, startup founders, and incubation center directors. Win seed grants, mentorship, and free incubation support.',
        category: 'Career',
        event_date: '2026-09-29',
        start_time: '11:00:00',
        end_time: '17:30:00',
        location: 'SAC Innovation Hub & Board Room',
        organizer_name: 'Edu Cell Convener',
        organizer_phone: '9876540011',
        registration_start: '2026-08-22 00:00:00',
        registration_deadline: '2026-09-25 23:59:59',
        capacity: 60,
        eligibility: 'Individual founders or teams (up to 4 members) from any discipline',
        target_department: 'Management Studies (MBA), Engineering, All Branches',
        required_skills: ['Pitching', 'Market Research', 'Financial Modeling'],
        relevant_interests: ['Entrepreneurship', 'Venture Capital', 'Startups'],
        poster_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Prepare a 5-minute slide deck (max 10 slides) covering problem, solution, market size, and traction.',
        prize_info: '₹1,00,000 Seed Grant for Winner + 6 Months Incubation Support',
        certificate_info: 'E-Cell Entrepreneurial Excellence Certificate',
        created_by: educellIds[1],
        updated_by: educellIds[1],
        status: 'UPCOMING',
      },
      {
        title: 'Algorithmic Speed Coding Olympiad 2026',
        description:
          'Fast-paced speed programming challenge testing algorithmic efficiency, dynamic programming, graph theory, and mathematical problem-solving under tight time limits.',
        category: 'Technical',
        event_date: '2026-09-14',
        start_time: '15:00:00',
        end_time: '18:00:00',
        location: 'Central Computing Facility Lab 1 & 2',
        organizer_name: 'Prof. Ravi Kumar',
        organizer_phone: '9845012345',
        registration_start: '2026-08-20 00:00:00',
        registration_deadline: '2026-09-13 20:00:00',
        capacity: 100,
        eligibility: 'All undergraduate and postgraduate students',
        target_department: 'Computer Science, IT, Mathematics',
        required_skills: ['C++', 'Java', 'Python', 'Algorithms', 'Data Structures'],
        relevant_interests: ['Competitive Programming', 'Algorithms', 'Hackathons'],
        poster_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Strict anti-plagiarism checks. Platform: HackerRank/Codeforces contest environment.',
        prize_info: 'Top 3 coders win mechanical keyboards, tech gear, and cash prizes',
        certificate_info: 'ACM Chapter Coding Merit Certificates',
        created_by: teacherIds[0],
        updated_by: teacherIds[0],
        status: 'UPCOMING',
      },
      {
        title: 'Higher Studies & GRE / GATE Roadmap Seminar',
        description:
          'Expert guidance on preparing for GATE, GRE, TOEFL, university shortlisting for MS/PhD abroad, scholarship applications, and writing impactful Statements of Purpose (SOP).',
        category: 'Seminar',
        event_date: '2026-09-20',
        start_time: '11:00:00',
        end_time: '14:00:00',
        location: 'Main Auditorium Hall B',
        organizer_name: 'Prof. Arun Deshmukh',
        organizer_phone: '9876501234',
        registration_start: '2026-08-24 00:00:00',
        registration_deadline: '2026-09-19 23:59:59',
        capacity: 180,
        eligibility: 'All branches (2nd, 3rd, and 4th year students)',
        target_department: 'All Departments',
        required_skills: ['Aptitude', 'Core Engineering', 'English Proficiency'],
        relevant_interests: ['Research', 'Higher Studies', 'GATE', 'GRE'],
        poster_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Interactive Q&A session with alumni currently studying at IISc, IITs, Stanford, and TU Munich.',
        prize_info: 'Free comprehensive study material kits for first 50 attendees',
        certificate_info: 'Participation Certificate',
        created_by: teacherIds[2],
        updated_by: teacherIds[2],
        status: 'UPCOMING',
      },
      {
        title: 'Inter-Department Basketball & Futsal Championship',
        description:
          'Annual sports tournament bringing together all departments in fierce, high-energy competition. Knockout tournament format with live commentary and cheer squads.',
        category: 'Sports',
        event_date: '2026-09-25',
        start_time: '08:00:00',
        end_time: '18:00:00',
        location: 'Campus Sports Complex & Indoor Arena',
        organizer_name: 'SAC Coordinator',
        organizer_phone: '9845099887',
        registration_start: '2026-08-26 00:00:00',
        registration_deadline: '2026-09-23 18:00:00',
        capacity: 160,
        eligibility: 'Department verified teams (Men & Women categories)',
        target_department: 'All Departments',
        required_skills: ['Athletics', 'Basketball', 'Football/Futsal'],
        relevant_interests: ['Sports', 'Fitness', 'Team Athletics'],
        poster_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Appropriate sports shoes and departmental jerseys are mandatory during matches.',
        prize_info: 'Championship Trophy, Gold/Silver Medals, and ₹30,000 sports equipment grant',
        certificate_info: 'SAC Sports Achievement Certificates',
        created_by: educellIds[0],
        updated_by: educellIds[0],
        status: 'UPCOMING',
      },
      {
        title: 'National Tech Symposium & Robotics Expo 2026',
        description:
          'Showcase of cutting-edge research papers, autonomous robotics demonstrations, line followers, drone obstacle course racing, and CAD design exhibitions.',
        category: 'Technical',
        event_date: '2026-10-10',
        start_time: '09:00:00',
        end_time: '17:00:00',
        location: 'Mechanical & Electronics Complex',
        organizer_name: 'Prof. Sunita Sharma',
        organizer_phone: '9812304567',
        registration_start: '2026-08-30 00:00:00',
        registration_deadline: '2026-10-06 23:59:59',
        capacity: 250,
        eligibility: 'All engineering disciplines and polytechnic institutes',
        target_department: 'Electronics, Mechanical, Electrical, Computer Science',
        required_skills: ['Robotics', 'Embedded Systems', 'CAD', 'IoT', 'Arduino'],
        relevant_interests: ['Robotics', 'Hardware', 'Electric Vehicles', 'Automation'],
        poster_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        external_registration_url: null,
        instructions: 'Safety goggles and hardware test kits must be checked at the arena registration desk.',
        prize_info: 'RoboWars Champion: ₹50,000 | Best Research Paper: ₹25,000',
        certificate_info: 'IEEE / ISTE Student Chapter Certified',
        created_by: teacherIds[1],
        updated_by: teacherIds[1],
        status: 'UPCOMING',
      },
    ];

    const eventIds: number[] = [];
    for (const ev of eventsData) {
      const [res] = await connection.query<any>(
        `INSERT INTO events (
          title, description, category, event_date, start_time, end_time, location,
          organizer_name, organizer_phone, registration_start, registration_deadline,
          capacity, eligibility, target_department, required_skills, relevant_interests,
          poster_url, external_registration_url, instructions, prize_info, certificate_info,
          created_by, updated_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ev.title,
          ev.description,
          ev.category,
          ev.event_date,
          ev.start_time,
          ev.end_time,
          ev.location,
          ev.organizer_name,
          ev.organizer_phone,
          ev.registration_start,
          ev.registration_deadline,
          ev.capacity,
          ev.eligibility,
          ev.target_department,
          JSON.stringify(ev.required_skills),
          JSON.stringify(ev.relevant_interests),
          ev.poster_url,
          ev.external_registration_url,
          ev.instructions,
          ev.prize_info,
          ev.certificate_info,
          ev.created_by,
          ev.updated_by,
          ev.status,
        ]
      );
      eventIds.push(res.insertId);
    }

    // 3. Insert Event History (Demonstrating Audit Log functionality)
    console.log('📜 Inserting Event History & Audit Diff Records...');

    // Record initial creations
    for (let i = 0; i < eventIds.length; i++) {
      await connection.query(
        `INSERT INTO event_history (event_id, changed_by, action, field_name, old_value, new_value, changed_at)
         VALUES (?, ?, 'CREATED', 'Event Creation', NULL, ?, NOW() - INTERVAL 5 DAY)`,
        [eventIds[i], eventsData[i].created_by, `Initial event publish by organizer`]
      );
    }

    // Add realistic update modifications to Event #1 (AI Hackathon)
    await connection.query(
      `INSERT INTO event_history (event_id, changed_by, action, field_name, old_value, new_value, changed_at)
       VALUES (?, ?, 'UPDATED', 'Venue / Location', 'Seminar Hall 3', 'Innovation Lab & Seminar Complex, Tech Tower', NOW() - INTERVAL 2 DAY)`,
      [eventIds[0], educellIds[0]] // SAC Coordinator changed venue
    );

    await connection.query(
      `INSERT INTO event_history (event_id, changed_by, action, field_name, old_value, new_value, changed_at)
       VALUES (?, ?, 'UPDATED', 'Capacity', '100', '150', NOW() - INTERVAL 2 DAY)`,
      [eventIds[0], educellIds[0]] // SAC Coordinator increased capacity
    );

    await connection.query(
      `INSERT INTO event_history (event_id, changed_by, action, field_name, old_value, new_value, changed_at)
       VALUES (?, ?, 'UPDATED', 'Prize Information', 'Total Prizes ₹1,00,000', '1st Prize: ₹75,000 | 2nd Prize: ₹45,000 | 3rd Prize: ₹25,000 + Internship Opportunities', NOW() - INTERVAL 1 DAY)`,
      [eventIds[0], teacherIds[0]] // Prof Ravi updated prize
    );

    // 4. Insert Applications with Diverse Statuses
    console.log('📝 Inserting Applications across diverse statuses...');

    const sampleApplications = [
      // Student 1 (Aarav) applications
      { event_id: eventIds[0], student_id: studentUserIds[0], status: 'Approved', notes: 'Shortlisted for Round 1 based on strong ML background.' },
      { event_id: eventIds[1], student_id: studentUserIds[0], status: 'Pending', notes: null },
      { event_id: eventIds[6], student_id: studentUserIds[0], status: 'Approved', notes: 'Competitive programming roster confirmed.' },

      // Student 2 (Priya) applications
      { event_id: eventIds[1], student_id: studentUserIds[1], status: 'Approved', notes: 'Lab seat #14 reserved.' },
      { event_id: eventIds[3], student_id: studentUserIds[1], status: 'Approved', notes: 'Cloud credentials sent.' },
      { event_id: eventIds[0], student_id: studentUserIds[1], status: 'Pending', notes: null },

      // Student 3 (Rohit) applications
      { event_id: eventIds[9], student_id: studentUserIds[2], status: 'Approved', notes: 'Robotics arena slot booked.' },
      { event_id: eventIds[4], student_id: studentUserIds[2], status: 'Pending', notes: null },
      { event_id: eventIds[2], student_id: studentUserIds[2], status: 'Rejected', notes: 'Targeted only for pre-final/final year batch.' },

      // Student 4 (Ananya) applications
      { event_id: eventIds[9], student_id: studentUserIds[3], status: 'Approved', notes: 'CAD exhibit confirmed.' },
      { event_id: eventIds[8], student_id: studentUserIds[3], status: 'Approved', notes: 'Women Basketball Team Captain.' },
      { event_id: eventIds[7], student_id: studentUserIds[3], status: 'Pending', notes: null },

      // Student 5 (Vikram) applications
      { event_id: eventIds[5], student_id: studentUserIds[4], status: 'Approved', notes: 'Pitch deck reviewed. Pitch slot #3.' },
      { event_id: eventIds[2], student_id: studentUserIds[4], status: 'Approved', notes: 'Mock GD batch A.' },
    ];

    for (const app of sampleApplications) {
      await connection.query(
        `INSERT INTO applications (event_id, student_id, status, notes, applied_at, updated_at)
         VALUES (?, ?, ?, ?, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY)`,
        [app.event_id, app.student_id, app.status, app.notes]
      );
    }

    // 5. Insert Bookmarks
    console.log('⭐ Inserting Bookmarks...');
    await connection.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [eventIds[0], studentUserIds[0]]);
    await connection.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [eventIds[3], studentUserIds[0]]);
    await connection.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [eventIds[0], studentUserIds[1]]);
    await connection.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [eventIds[5], studentUserIds[1]]);
    await connection.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [eventIds[9], studentUserIds[2]]);
    await connection.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [eventIds[4], studentUserIds[3]]);
    await connection.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [eventIds[5], studentUserIds[4]]);

    // 6. Insert Notifications
    console.log('🔔 Inserting In-App Notifications...');
    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, 'Application Approved 🎉', 'Your application for "National AI & ML Hackathon 2026" has been APPROVED! Check event instructions.', 'APPLICATION_STATUS', FALSE, NOW() - INTERVAL 1 DAY)`,
      [studentUserIds[0]]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, 'Event Details Updated 📢', 'Venue for "National AI & ML Hackathon 2026" was changed to Innovation Lab & Seminar Complex.', 'EVENT_UPDATE', FALSE, NOW() - INTERVAL 2 DAY)`,
      [studentUserIds[0]]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, 'Application Approved 🎉', 'Your application for "Full-Stack React & Node.js Production Masterclass" has been APPROVED.', 'APPLICATION_STATUS', TRUE, NOW() - INTERVAL 2 DAY)`,
      [studentUserIds[1]]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, 'Registration Deadline Approaching ⏳', 'Reminder: Registration for "Algorithmic Speed Coding Olympiad 2026" closes soon!', 'DEADLINE_ALERT', FALSE, NOW() - INTERVAL 3 HOUR)`,
      [studentUserIds[0]]
    );

    // 7. Insert Reminders
    console.log('⏰ Inserting Smart Reminders...');
    await connection.query(
      `INSERT INTO reminders (event_id, student_id, reminder_type, reminder_time, status)
       VALUES (?, ?, '1_DAY_BEFORE', '2026-09-17 09:00:00', 'PENDING')`,
      [eventIds[0], studentUserIds[0]]
    );

    await connection.query(
      `INSERT INTO reminders (event_id, student_id, reminder_type, reminder_time, status)
       VALUES (?, ?, '1_HOUR_BEFORE', '2026-09-12 09:00:00', 'PENDING')`,
      [eventIds[1], studentUserIds[1]]
    );

    // 8. Insert System Audit Logs
    console.log('🛡️ Inserting Audit Logs...');
    await connection.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, 'INITIAL_SEED', 'system', NULL, '{"message": "Campus seed dataset successfully loaded"}', '127.0.0.1', NOW())`,
      [educellIds[0]]
    );

    await connection.commit();
    console.log('✅ Seed completed successfully! All accounts and events are ready.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Eventra database ready.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seed error:', err);
      process.exit(1);
    });
}
