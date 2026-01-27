-- Add subject_id to topics table for multi-subject support
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS subject_id uuid;

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text DEFAULT 'book',
  color text DEFAULT 'primary',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Anyone can view subjects
CREATE POLICY "Anyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

-- Insert all WAEC subjects
INSERT INTO public.subjects (name, description, icon, color, order_index) VALUES
  ('Mathematics', 'Numbers, algebra, geometry, statistics and more', 'Calculator', 'primary', 1),
  ('English Language', 'Grammar, comprehension, essay writing and oral', 'BookOpen', 'blue', 2),
  ('Physics', 'Mechanics, waves, electricity and modern physics', 'Zap', 'yellow', 3),
  ('Chemistry', 'Organic, inorganic and physical chemistry', 'Flask', 'green', 4),
  ('Biology', 'Cell biology, genetics, ecology and human anatomy', 'Leaf', 'emerald', 5),
  ('Economics', 'Micro and macroeconomics, trade and development', 'TrendingUp', 'orange', 6),
  ('Government', 'Political systems, constitution and citizenship', 'Landmark', 'purple', 7),
  ('Literature in English', 'Prose, poetry, drama and literary appreciation', 'BookText', 'pink', 8),
  ('Agricultural Science', 'Crop production, animal husbandry and farm management', 'Wheat', 'lime', 9),
  ('Commerce', 'Trade, business organizations and financial institutions', 'Store', 'cyan', 10),
  ('Accounting', 'Financial statements, bookkeeping and analysis', 'Receipt', 'indigo', 11),
  ('Geography', 'Physical and human geography, map reading', 'Globe', 'teal', 12),
  ('Further Mathematics', 'Advanced algebra, calculus and statistics', 'Sigma', 'rose', 13),
  ('Civic Education', 'Values, rights, duties and national consciousness', 'Users', 'amber', 14),
  ('Computer Studies', 'Hardware, software, programming and ICT', 'Monitor', 'slate', 15),
  ('Christian Religious Studies', 'Bible knowledge, Christian ethics and doctrine', 'Church', 'violet', 16),
  ('Islamic Studies', 'Quran, Hadith, Fiqh and Islamic history', 'Moon', 'sky', 17),
  ('History', 'Nigerian, African and world history', 'Clock', 'stone', 18),
  ('French', 'Grammar, comprehension and oral French', 'Languages', 'red', 19),
  ('Yoruba', 'Grammar, literature and oral Yoruba', 'MessageCircle', 'fuchsia', 20),
  ('Igbo', 'Grammar, literature and oral Igbo', 'MessageSquare', 'emerald', 21),
  ('Hausa', 'Grammar, literature and oral Hausa', 'MessagesSquare', 'orange', 22)
ON CONFLICT (name) DO NOTHING;

-- Update existing topics to link to Mathematics subject
UPDATE public.topics 
SET subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
WHERE subject_id IS NULL;

-- Add foreign key constraint
ALTER TABLE public.topics 
ADD CONSTRAINT topics_subject_id_fkey 
FOREIGN KEY (subject_id) REFERENCES public.subjects(id);

-- Add more topics for other subjects
-- English Language topics
INSERT INTO public.topics (title, description, waec_chapter, icon, order_index, estimated_duration_minutes, subject_id) VALUES
  ('Parts of Speech', 'Nouns, verbs, adjectives, adverbs and more', 'Grammar', 'BookOpen', 1, 45, (SELECT id FROM public.subjects WHERE name = 'English Language')),
  ('Tenses', 'Past, present, future and their variations', 'Grammar', 'Clock', 2, 40, (SELECT id FROM public.subjects WHERE name = 'English Language')),
  ('Comprehension Skills', 'Reading and understanding passages', 'Comprehension', 'FileText', 3, 50, (SELECT id FROM public.subjects WHERE name = 'English Language')),
  ('Essay Writing', 'Narrative, descriptive, argumentative essays', 'Writing', 'PenTool', 4, 60, (SELECT id FROM public.subjects WHERE name = 'English Language')),
  ('Summary Writing', 'Techniques for effective summarization', 'Writing', 'ListChecks', 5, 45, (SELECT id FROM public.subjects WHERE name = 'English Language'));

-- Physics topics
INSERT INTO public.topics (title, description, waec_chapter, icon, order_index, estimated_duration_minutes, subject_id) VALUES
  ('Measurement and Units', 'SI units, measuring instruments, errors', 'Mechanics', 'Ruler', 1, 35, (SELECT id FROM public.subjects WHERE name = 'Physics')),
  ('Motion', 'Speed, velocity, acceleration, equations of motion', 'Mechanics', 'MoveRight', 2, 50, (SELECT id FROM public.subjects WHERE name = 'Physics')),
  ('Forces', 'Types of forces, Newton''s laws, friction', 'Mechanics', 'ArrowUpDown', 3, 55, (SELECT id FROM public.subjects WHERE name = 'Physics')),
  ('Work, Energy and Power', 'Mechanical energy, conservation, machines', 'Mechanics', 'Zap', 4, 50, (SELECT id FROM public.subjects WHERE name = 'Physics')),
  ('Waves', 'Properties, types, sound and light waves', 'Waves', 'Waves', 5, 60, (SELECT id FROM public.subjects WHERE name = 'Physics'));

-- Chemistry topics
INSERT INTO public.topics (title, description, waec_chapter, icon, order_index, estimated_duration_minutes, subject_id) VALUES
  ('Atomic Structure', 'Atoms, electrons, protons, neutrons', 'Physical Chemistry', 'Atom', 1, 45, (SELECT id FROM public.subjects WHERE name = 'Chemistry')),
  ('Chemical Bonding', 'Ionic, covalent, metallic bonds', 'Physical Chemistry', 'Link', 2, 50, (SELECT id FROM public.subjects WHERE name = 'Chemistry')),
  ('Periodic Table', 'Groups, periods, periodic trends', 'Inorganic Chemistry', 'Table', 3, 40, (SELECT id FROM public.subjects WHERE name = 'Chemistry')),
  ('Acids, Bases and Salts', 'Properties, reactions, pH scale', 'Inorganic Chemistry', 'Droplets', 4, 55, (SELECT id FROM public.subjects WHERE name = 'Chemistry')),
  ('Organic Chemistry', 'Hydrocarbons, functional groups, reactions', 'Organic Chemistry', 'Hexagon', 5, 65, (SELECT id FROM public.subjects WHERE name = 'Chemistry'));

-- Biology topics
INSERT INTO public.topics (title, description, waec_chapter, icon, order_index, estimated_duration_minutes, subject_id) VALUES
  ('Cell Structure', 'Cell organelles, plant vs animal cells', 'Cell Biology', 'Circle', 1, 45, (SELECT id FROM public.subjects WHERE name = 'Biology')),
  ('Cell Division', 'Mitosis, meiosis, cell cycle', 'Cell Biology', 'Split', 2, 50, (SELECT id FROM public.subjects WHERE name = 'Biology')),
  ('Genetics', 'Heredity, Mendel''s laws, DNA', 'Genetics', 'Dna', 3, 60, (SELECT id FROM public.subjects WHERE name = 'Biology')),
  ('Ecology', 'Ecosystems, food chains, nutrient cycles', 'Ecology', 'Trees', 4, 55, (SELECT id FROM public.subjects WHERE name = 'Biology')),
  ('Human Anatomy', 'Body systems, organs, functions', 'Anatomy', 'Heart', 5, 65, (SELECT id FROM public.subjects WHERE name = 'Biology'));

-- Economics topics
INSERT INTO public.topics (title, description, waec_chapter, icon, order_index, estimated_duration_minutes, subject_id) VALUES
  ('Basic Economic Concepts', 'Scarcity, choice, opportunity cost', 'Introduction', 'Lightbulb', 1, 40, (SELECT id FROM public.subjects WHERE name = 'Economics')),
  ('Demand and Supply', 'Laws, elasticity, market equilibrium', 'Microeconomics', 'Scale', 2, 50, (SELECT id FROM public.subjects WHERE name = 'Economics')),
  ('Production', 'Factors, costs, economies of scale', 'Microeconomics', 'Factory', 3, 45, (SELECT id FROM public.subjects WHERE name = 'Economics')),
  ('Money and Banking', 'Functions of money, banking system', 'Macroeconomics', 'Banknote', 4, 50, (SELECT id FROM public.subjects WHERE name = 'Economics')),
  ('International Trade', 'Imports, exports, balance of payments', 'International', 'Ship', 5, 55, (SELECT id FROM public.subjects WHERE name = 'Economics'));