-- Seed categories and skills

-- ============================================================================
-- CATEGORIES
-- ============================================================================

INSERT INTO categories (name, description)
SELECT name, description FROM (VALUES
  ('Web Development',  'Full-stack, frontend, backend, and API development'),
  ('Mobile Apps',      'iOS, Android, and cross-platform mobile applications'),
  ('UI/UX Design',     'User interface and user experience design'),
  ('Data & AI',        'Data analysis, machine learning, and AI solutions'),
  ('Writing',          'Technical writing, content creation, and documentation'),
  ('Multimedia',       'Video editing, graphic design, and multimedia production')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.name = v.name);

-- ============================================================================
-- SKILLS  (uses WHERE NOT EXISTS to avoid conflict with functional index)
-- ============================================================================

INSERT INTO skills (name)
SELECT v.name FROM (VALUES
  ('React'), ('JavaScript'), ('Python'), ('FastAPI'), ('Node.js'),
  ('Tailwind CSS'), ('Figma'), ('UI/UX Design'), ('SQL'), ('Supabase'),
  ('Flutter'), ('Data Analysis'), ('Technical Writing'), ('Machine Learning'),
  ('Graphic Design'), ('Video Editing'), ('TypeScript'), ('Vue.js'),
  ('Angular'), ('Django'), ('Express.js'), ('PostgreSQL'), ('MongoDB'),
  ('MySQL'), ('Git'), ('Docker'), ('AWS'), ('Azure'), ('Firebase'),
  ('React Native'), ('Swift'), ('Kotlin'), ('Java'), ('C++'), ('C#'),
  ('.NET'), ('PHP'), ('Laravel'), ('WordPress'), ('Shopify'), ('SEO'),
  ('Content Writing'), ('Copywriting'), ('Proofreading'),
  ('Adobe Photoshop'), ('Adobe Illustrator'), ('Adobe XD'), ('Sketch'),
  ('InVision'), ('After Effects'), ('Premiere Pro'), ('Final Cut Pro'),
  ('3D Modeling'), ('Blender'), ('Unity'), ('Unreal Engine'),
  ('Game Development'), ('Blockchain'), ('Solidity'), ('Web3'), ('NFT'),
  ('DevOps'), ('CI/CD'), ('Kubernetes'), ('Linux'), ('Bash'),
  ('API Development'), ('REST API'), ('GraphQL'), ('Microservices'),
  ('Testing'), ('Jest'), ('Pytest'), ('Selenium'), ('Cypress'),
  ('Agile'), ('Scrum'), ('Project Management')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM skills s WHERE LOWER(s.name) = LOWER(v.name));
