'use server';
/**
 * @fileOverview An AI assistant that helps students draft or refine Statements of Purpose (SOP) for scholarships.
 *
 * - aiPoweredSopAssistant - A function that handles the SOP generation and refinement process.
 * - AiPoweredSopAssistantInput - The input type for the aiPoweredSopAssistant function.
 * - AiPoweredSopAssistantOutput - The return type for the aiPoweredSopAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiPoweredSopAssistantInputSchema = z.object({
  scholarshipName: z.string().describe('The name of the scholarship.'),
  scholarshipDescription: z.string().describe('A brief description of the scholarship, including its purpose and target audience.'),
  academicBackground: z.string().describe('A summary of the student\u0027s academic achievements, relevant courses, and grades.'),
  extracurricularActivities: z.string().describe('A summary of the student\u0027s extracurricular activities, volunteering, work experience, and leadership roles.'),
  futureGoals: z.string().describe('The student\u0027s future academic and career goals, and how this scholarship will help achieve them.'),
  keyThemes: z.string().optional().describe('Any specific themes, personal stories, or unique experiences the student wishes to highlight in the SOP.'),
  existingSopDraft: z.string().optional().describe('An existing draft of the SOP that the AI should refine or improve.'),
});
export type AiPoweredSopAssistantInput = z.infer<typeof AiPoweredSopAssistantInputSchema>;

const AiPoweredSopAssistantOutputSchema = z.object({
  refinedSop: z.string().describe('The generated or refined Statement of Purpose.'),
  suggestions: z.string().optional().describe('Additional suggestions for further improvement of the SOP.'),
});
export type AiPoweredSopAssistantOutput = z.infer<typeof AiPoweredSopAssistantOutputSchema>;

export async function aiPoweredSopAssistant(input: AiPoweredSopAssistantInput): Promise<AiPoweredSopAssistantOutput> {
  return aiPoweredSopAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sopAssistantPrompt',
  input: { schema: AiPoweredSopAssistantInputSchema },
  output: { schema: AiPoweredSopAssistantOutputSchema },
  prompt: `You are an AI assistant specialized in helping students write compelling Statements of Purpose (SOPs) for scholarships. Your goal is to generate a well-structured, persuasive, and grammatically correct SOP based on the provided student information, or refine an existing draft.

### Scholarship Details:
Scholarship Name: {{{scholarshipName}}}
Scholarship Description: {{{scholarshipDescription}}}

### Student Background:
Academic Background: {{{academicBackground}}}
Extracurricular Activities/Experience: {{{extracurricularActivities}}}
Future Goals: {{{futureGoals}}}
{{#if keyThemes}}
Key Themes/Points to Highlight: {{{keyThemes}}}
{{/if}}

{{#if existingSopDraft}}
### Existing SOP Draft (Refine this):
{{{existingSopDraft}}}

Carefully review the existing draft and improve its clarity, coherence, persuasiveness, and alignment with the scholarship description and the student's profile. Ensure it addresses all aspects of a strong SOP.
{{else}}
### Task:
Generate a compelling Statement of Purpose (SOP) using the provided student background and scholarship details. The SOP should be structured logically, articulate the student's motivation, demonstrate their qualifications, and clearly explain how the scholarship aligns with their future aspirations.
{{/if}}

Ensure the tone is professional and confident. Focus on showcasing the student's unique strengths and potential.

Provide the generated/refined SOP in the 'refinedSop' field. If you have additional advice or specific suggestions for improving the SOP further (e.g., specific examples to add, areas to elaborate on), include them in the 'suggestions' field.
`,
});

const aiPoweredSopAssistantFlow = ai.defineFlow(
  {
    name: 'aiPoweredSopAssistantFlow',
    inputSchema: AiPoweredSopAssistantInputSchema,
    outputSchema: AiPoweredSopAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate SOP.');
    }
    return output;
  }
);
