# Syntaxless - Code in Plain English

Syntaxless is a web application that allows users to write code in plain English. It uses AI to translate natural language instructions into working code in multiple programming languages

## Features

- **Natural Language to Code**: Write instructions in plain English and get working code.
- **Multiple Languages**: Supports Python, JavaScript, Java, and C++.
- **Project Management**: Create, save, and manage your coding projects.
- **Interactive IDE**: Write, run, and debug your code in the browser with a streamlined interface.
- **Authentication**: Secure authentication with email/password and Google OAuth.
- **Language Selection**: Choose your target programming language from a dropdown menu.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/syntaxless.git
   cd syntaxless
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up Supabase database:
   - Follow the detailed guide in [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - Or quickly run the SQL migration in `supabase/migrations/001_create_projects_table.sql` in your Supabase SQL Editor

4. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   \`\`\`
   
   Get your Supabase credentials from your project's Settings → API page.

5. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

6. (Optional) For local code execution, start the Python server in a separate terminal:
   \`\`\`bash
   cd api
   python run.py
   \`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

📖 **For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)**

The application uses Supabase for authentication and data storage. The database schema includes:

- **`projects` table**: Stores user projects with natural language code and generated code
- **Row Level Security (RLS)**: Ensures users can only access their own projects
- **Automatic timestamps**: `created_at` and `updated_at` are automatically managed

Quick setup: Run the SQL migration file `supabase/migrations/001_create_projects_table.sql` in your Supabase SQL Editor.

## IDE Features

- **Single Code View**: Toggle between natural language input and generated code for maximum screen space
- **Language Selection**: Choose from Python, JavaScript, Java, or C++ for code generation
- **Bottom Console**: View output and clarifications in a dedicated bottom panel
- **Real-time Translation**: Convert natural language to code instantly

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Authentication and Database)
- CodeMirror (Code Editor)
- shadcn/ui (UI Components)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
