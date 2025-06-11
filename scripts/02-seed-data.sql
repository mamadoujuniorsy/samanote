-- Insert sample subjects (this will only work after a user is authenticated)
-- This is just for reference, actual seeding will happen through the app

-- Sample subjects
INSERT INTO subjects (user_id, name, description, color) VALUES
  (auth.uid(), 'Mathématiques', 'Algèbre, géométrie, analyse', 'bg-blue-500'),
  (auth.uid(), 'Physique', 'Mécanique, électricité, thermodynamique', 'bg-green-500'),
  (auth.uid(), 'Chimie', 'Chimie organique et inorganique', 'bg-purple-500'),
  (auth.uid(), 'Histoire', 'Histoire moderne et contemporaine', 'bg-orange-500')
ON CONFLICT DO NOTHING;
