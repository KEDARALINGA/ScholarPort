
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Wand2, Copy, Check } from "lucide-react";
import { aiPoweredSopAssistant } from "@/ai/flows/ai-powered-sop-assistant-flow";
import { useToast } from "@/hooks/use-toast";

interface SopAssistantProps {
  scholarshipName: string;
  scholarshipDescription: string;
  studentProfile: {
    academicBackground: string;
    extracurricularActivities: string;
    futureGoals: string;
  };
  onSopGenerated: (sop: string) => void;
}

export function SopAssistant({ scholarshipName, scholarshipDescription, studentProfile, onSopGenerated }: SopAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [refinedSop, setRefinedSop] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await aiPoweredSopAssistant({
        scholarshipName,
        scholarshipDescription,
        ...studentProfile,
      });
      setRefinedSop(result.refinedSop);
      setSuggestions(result.suggestions || "");
      toast({
        title: "Sop Draft Generated!",
        description: "AI has drafted a compelling statement for you.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate SOP. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refinedSop);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useAsSop = () => {
    onSopGenerated(refinedSop);
  };

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">AI SOP Assistant</CardTitle>
        </div>
        <CardDescription>
          Get a professional draft of your Statement of Purpose based on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {refinedSop ? (
          <div className="space-y-4">
            <div className="relative">
              <Textarea 
                value={refinedSop} 
                onChange={(e) => setRefinedSop(e.target.value)}
                className="min-h-[300px] bg-background font-body leading-relaxed" 
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {suggestions && (
              <div className="p-3 rounded-md bg-secondary/50 text-sm italic text-muted-foreground border-l-4 border-primary/20">
                <strong>AI Suggestions:</strong> {suggestions}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 rounded-full bg-accent/10">
              <Wand2 className="h-8 w-8 text-accent animate-pulse" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Click the button below to generate a tailored Statement of Purpose using AI.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleGenerate} 
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {refinedSop ? "Regenerate Draft" : "Generate SOP Draft"}
            </>
          )}
        </Button>
        {refinedSop && (
          <Button onClick={useAsSop}>
            Apply this SOP
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
