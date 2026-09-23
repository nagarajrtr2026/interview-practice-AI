CREATE TABLE public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  overall_score int NOT NULL DEFAULT 0,
  relevance int NOT NULL DEFAULT 0,
  technical int NOT NULL DEFAULT 0,
  communication int NOT NULL DEFAULT 0,
  confidence int NOT NULL DEFAULT 0,
  clarity int NOT NULL DEFAULT 0,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  improvements jsonb NOT NULL DEFAULT '[]'::jsonb,
  tips jsonb NOT NULL DEFAULT '[]'::jsonb,
  improved_answer text NOT NULL DEFAULT '',
  total_words int NOT NULL DEFAULT 0,
  filler_words int NOT NULL DEFAULT 0,
  filler_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO authenticated;
GRANT ALL ON public.interviews TO service_role;

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read interviews" ON public.interviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert interviews" ON public.interviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete interviews" ON public.interviews FOR DELETE USING (true);

CREATE INDEX interviews_session_created_idx ON public.interviews (session_id, created_at DESC);

INSERT INTO public.interviews (session_id, question, answer, overall_score, relevance, technical, communication, confidence, clarity, strengths, improvements, tips, improved_answer, total_words, filler_words, filler_breakdown, is_demo, created_at) VALUES
('demo', 'Tell me about yourself.', 'I am basically a frontend developer with about three years of experience, um, mostly building React dashboards and design systems.', 78, 80, 72, 82, 76, 80, '["Clear career summary","Concrete years of experience","Relevant tech stack mentioned"]', '["Add a measurable achievement","Reduce filler words","End with why this role"]', '["Use a 30-second structure: now, past, why here","Practice out loud to cut fillers"]', 'I am a frontend developer with three years of experience building React dashboards and design systems, most recently leading a component library used across four product teams.', 21, 2, '{"basically":1,"um":1}', true, now() - interval '18 days'),
('demo', 'Describe a challenging bug you fixed.', 'We had a memory leak in a dashboard. I profiled the app, found listeners that were never removed, and fixed the cleanup logic.', 85, 88, 86, 84, 82, 85, '["Clear problem-action-result structure","Shows debugging methodology"]', '["Quantify the impact","Mention prevention steps added"]', '["Close with the measurable outcome","Name the tools you used"]', 'We had a memory leak that crashed our dashboard after long sessions. I profiled with Chrome DevTools, traced it to event listeners that were never removed, fixed the cleanup, and cut memory growth by 90%.', 23, 0, '{}', true, now() - interval '12 days'),
('demo', 'Why do you want to work here?', 'You know, I like the product and I think it is, like, a good fit for my skills honestly.', 61, 58, 55, 64, 62, 66, '["Honest tone","Shows product interest"]', '["Be specific about the product","Connect your skills to their roadmap","Remove filler words"]', '["Research two recent company announcements","Name the exact team problem you can solve"]', 'I have followed your analytics product since the v2 launch, and the problems you are solving around real-time reporting match exactly what I built in my last role.', 19, 3, '{"you know":1,"like":1,"honestly":1}', true, now() - interval '8 days'),
('demo', 'How do you handle tight deadlines?', 'I break the work into must-have and nice-to-have, communicate early with stakeholders, and protect focus time for the critical path.', 88, 90, 84, 90, 88, 88, '["Structured prioritisation framework","Emphasis on communication"]', '["Add a specific example","Mention how you measured success"]', '["Pair the framework with one real story","Keep the answer under 90 seconds"]', 'I split scope into must-have and nice-to-have, flag risks to stakeholders on day one, and protect focus time for the critical path. On our last launch that approach shipped on time with zero P1 bugs.', 21, 0, '{}', true, now() - interval '5 days'),
('demo', 'Explain REST vs GraphQL.', 'REST uses fixed endpoints per resource, actually, while GraphQL exposes one endpoint and lets the client request exactly the fields it needs.', 82, 86, 88, 80, 76, 82, '["Accurate technical contrast","Concise explanation"]', '["Mention trade-offs like caching and complexity","Give a project example"]', '["Add when you would choose each","Avoid the filler word actually"]', 'REST exposes fixed endpoints per resource and caches well at the HTTP layer, while GraphQL uses a single endpoint where clients request exactly the fields they need, which reduces over-fetching but shifts complexity to the server.', 22, 1, '{"actually":1}', true, now() - interval '2 days');
