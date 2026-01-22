-- Seed initial WAEC Mathematics Topics
INSERT INTO public.topics (id, title, description, waec_chapter, icon, order_index, estimated_duration_minutes, is_premium) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Number Bases', 'Learn to convert between different number bases and perform arithmetic operations in various bases.', 'Number and Numeration', 'Calculator', 1, 90, false),
('550e8400-e29b-41d4-a716-446655440002', 'Fractions, Decimals & Percentages', 'Master operations with fractions, decimals, and percentages including conversions and applications.', 'Number and Numeration', 'Percent', 2, 120, false),
('550e8400-e29b-41d4-a716-446655440003', 'Indices & Logarithms', 'Understand the laws of indices and logarithms and apply them to solve equations.', 'Number and Numeration', 'Superscript', 3, 100, false),
('550e8400-e29b-41d4-a716-446655440004', 'Algebraic Expressions', 'Simplify, expand, and factorize algebraic expressions including quadratics.', 'Algebraic Processes', 'Variable', 4, 110, false),
('550e8400-e29b-41d4-a716-446655440005', 'Linear Equations', 'Solve linear equations and inequalities, including simultaneous equations.', 'Algebraic Processes', 'Equal', 5, 100, false),
('550e8400-e29b-41d4-a716-446655440006', 'Quadratic Equations', 'Master solving quadratic equations using factorization, formula, and completing the square.', 'Algebraic Processes', 'Parabola', 6, 120, true),
('550e8400-e29b-41d4-a716-446655440007', 'Sets & Venn Diagrams', 'Understand set notation, operations, and solve problems using Venn diagrams.', 'Algebraic Processes', 'CircleDot', 7, 90, false),
('550e8400-e29b-41d4-a716-446655440008', 'Mensuration', 'Calculate perimeters, areas, and volumes of 2D and 3D shapes.', 'Mensuration', 'Ruler', 8, 150, false),
('550e8400-e29b-41d4-a716-446655440009', 'Plane Geometry', 'Study properties of angles, triangles, circles, and polygons.', 'Plane Geometry', 'Triangle', 9, 140, false),
('550e8400-e29b-41d4-a716-446655440010', 'Trigonometry', 'Learn trigonometric ratios, identities, and solve problems involving triangles.', 'Trigonometry', 'Sigma', 10, 130, true),
('550e8400-e29b-41d4-a716-446655440011', 'Statistics', 'Collect, organize, analyze, and interpret data using various statistical measures.', 'Statistics and Probability', 'BarChart3', 11, 110, false),
('550e8400-e29b-41d4-a716-446655440012', 'Probability', 'Calculate probabilities of simple and compound events.', 'Statistics and Probability', 'Dice5', 12, 90, false);

-- Seed Lessons for Number Bases topic
INSERT INTO public.lessons (id, topic_id, title, order_index, estimated_duration_minutes, is_downloadable, key_formulas, exam_tips, common_mistakes, content_step_by_step, content_practice_heavy, content_fast_revision, content_challenge) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Introduction to Number Bases', 1, 15, true,
  ARRAY['Base b number: d₀×b⁰ + d₁×b¹ + d₂×b² + ...', 'Common bases: Binary (2), Octal (8), Decimal (10), Hexadecimal (16)'],
  ARRAY['Always show your conversion steps clearly', 'Check your answer by converting back to the original base'],
  ARRAY['Forgetting that positions start from 0, not 1', 'Confusing the base with the digits'],
  '{"sections": [{"title": "What is a Number Base?", "content": "A number base (or radix) is the number of unique digits used to represent numbers. In our everyday decimal system, we use 10 digits (0-9), so we call it base 10."}, {"title": "Understanding Place Values", "content": "Each position in a number represents a power of the base. In decimal, 234 means 2×10² + 3×10¹ + 4×10⁰ = 200 + 30 + 4."}]}',
  '{"questions": [{"question": "What base uses only digits 0 and 1?", "options": ["Base 2", "Base 8", "Base 10"], "answer": 0}]}',
  '{"keyPoints": ["Number base = count of unique digits", "Place value = base raised to position power", "Binary=2, Octal=8, Decimal=10, Hex=16"]}',
  '{"problems": [{"question": "In what base is 132 equal to 30 in decimal?", "answer": "4", "hint": "Think: 1×b² + 3×b + 2 = 30"}]}'
),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Converting from Base 10', 2, 20, true,
  ARRAY['Divide by new base repeatedly', 'Collect remainders from bottom to top'],
  ARRAY['Write remainders in reverse order', 'Stop when quotient becomes 0'],
  ARRAY['Reading remainders in wrong order', 'Stopping too early in division'],
  '{"sections": [{"title": "The Division Method", "content": "To convert from base 10 to another base, repeatedly divide by the new base and collect the remainders."}, {"title": "Example: 45 to Binary", "content": "45÷2=22 R1, 22÷2=11 R0, 11÷2=5 R1, 5÷2=2 R1, 2÷2=1 R0, 1÷2=0 R1. Reading remainders bottom-up: 101101₂"}]}',
  '{"questions": [{"question": "Convert 25 to base 2", "options": ["11001", "10011", "11010"], "answer": 0}]}',
  '{"keyPoints": ["Keep dividing by target base", "Remainders form answer (read backwards)", "Stop when quotient = 0"]}',
  '{"problems": [{"question": "Convert 156 to base 8", "answer": "234", "hint": "Divide by 8 repeatedly"}]}'
),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Converting to Base 10', 3, 18, true,
  ARRAY['Multiply each digit by base^position', 'Sum all products'],
  ARRAY['Start position numbering from 0 (rightmost)', 'Double-check your powers of the base'],
  ARRAY['Starting position count from 1 instead of 0', 'Wrong power calculations'],
  '{"sections": [{"title": "The Expansion Method", "content": "To convert any base to base 10, multiply each digit by the base raised to its position power, then add all results."}, {"title": "Example: 1101₂ to Decimal", "content": "1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13"}]}',
  '{"questions": [{"question": "Convert 234₈ to base 10", "options": ["156", "148", "164"], "answer": 0}]}',
  '{"keyPoints": ["Position 0 starts at rightmost digit", "Multiply: digit × base^position", "Add all products together"]}',
  '{"problems": [{"question": "Convert 2A3₁₆ to base 10", "answer": "675", "hint": "A=10 in hexadecimal"}]}'
),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Operations in Different Bases', 4, 25, true,
  ARRAY['Addition: carry when sum ≥ base', 'Subtraction: borrow = base value'],
  ARRAY['Show carry/borrow clearly in your working', 'Convert to base 10 to verify your answer'],
  ARRAY['Forgetting to carry when sum exceeds base', 'Using wrong borrow values'],
  '{"sections": [{"title": "Addition in Other Bases", "content": "Add digits column by column. When sum ≥ base, carry 1 to the next column."}, {"title": "Example: 110₂ + 101₂", "content": "Column 1: 0+1=1, Column 2: 1+0=1, Column 3: 1+1=10₂ (carry 1). Answer: 1011₂"}]}',
  '{"questions": [{"question": "Calculate 234₅ + 143₅", "options": ["432₅", "422₅", "332₅"], "answer": 1}]}',
  '{"keyPoints": ["Add/subtract column by column", "Carry when sum ≥ base", "Borrow equals base value"]}',
  '{"problems": [{"question": "Calculate 1101₂ × 101₂ and give answer in binary", "answer": "1000001", "hint": "Use the same multiplication method as decimal"}]}'
);

-- Seed Lessons for Fractions, Decimals & Percentages
INSERT INTO public.lessons (id, topic_id, title, order_index, estimated_duration_minutes, is_downloadable, key_formulas, exam_tips, common_mistakes) VALUES
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Understanding Fractions', 1, 20, true,
  ARRAY['Fraction = Numerator/Denominator', 'Equivalent fractions: a/b = (a×k)/(b×k)'],
  ARRAY['Always simplify your final answer', 'Find LCM for adding fractions with different denominators'],
  ARRAY['Adding numerators and denominators separately', 'Forgetting to simplify']
),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Operations with Fractions', 2, 25, true,
  ARRAY['a/b + c/d = (ad + bc)/bd', 'a/b × c/d = ac/bd', 'a/b ÷ c/d = a/b × d/c'],
  ARRAY['Invert and multiply for division', 'Find common denominator for addition'],
  ARRAY['Not inverting when dividing', 'Wrong common denominator']
),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'Decimals and Conversions', 3, 20, true,
  ARRAY['Fraction to decimal: divide numerator by denominator', 'Decimal to percentage: multiply by 100'],
  ARRAY['Line up decimal points for addition/subtraction', 'Count decimal places for multiplication'],
  ARRAY['Misaligning decimal points', 'Wrong decimal place in answer']
),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'Percentage Applications', 4, 25, true,
  ARRAY['Percentage = (Part/Whole) × 100', 'Increase = Original × (1 + rate)', 'Decrease = Original × (1 - rate)'],
  ARRAY['Read percentage problems carefully for what to find', 'Convert percentages to decimals for calculations'],
  ARRAY['Confusing percentage of vs percentage increase', 'Not converting percentage to decimal']
);