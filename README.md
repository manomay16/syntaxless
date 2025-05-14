# Pseudolang - Code in Plain English

Pseudolang is a web application that allows users to write code in plain English. It uses AI to translate natural language instructions into working code.

## Features

- **Natural Language to Code**: Write instructions in plain English and get working code.
- **Multiple Languages**: Currently supports Python and JavaScript.
- **Project Management**: Create, save, and manage your coding projects.
- **Interactive IDE**: Write, run, and debug your code in the browser.
- **Authentication**: Secure authentication with email/password and Google OAuth.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/pseudolang.git
   cd pseudolang
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

The application uses Supabase for authentication and data storage. You need to create the following table:

\`\`\`sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  generated_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own projects" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);
\`\`\`

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Authentication and Database)
- CodeMirror (Code Editor)
- shadcn/ui (UI Components)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's update the globals.css to ensure proper theme support:
