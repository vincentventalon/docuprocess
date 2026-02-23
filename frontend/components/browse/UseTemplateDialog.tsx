"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";

type ExampleTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
};

type UseTemplateDialogProps = {
  template: ExampleTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UseTemplateDialog({
  template,
  open,
  onOpenChange,
}: UseTemplateDialogProps) {
  const router = useRouter();
  const [templateName, setTemplateName] = useState(`${template.name} (Copy)`);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTemplate = async () => {
    setIsCreating(true);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create a template");
      }

      // Call the database function to instantiate the template
      const { data: newTemplateId, error } = await supabase.rpc(
        "instantiate_template_from_example",
        {
          p_example_template_id: template.id,
          p_user_id: user.id,
          p_new_name: templateName,
        }
      );

      if (error) {
        throw error;
      }

      // Success!
      toast.success(`"${templateName}" has been added to your templates!`);

      // Close dialog
      onOpenChange(false);

      // Redirect to designer with the new template
      router.push(`/dashboard/templates/designer?template_id=${newTemplateId}`);
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create template. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Create Template from Example
          </DialogTitle>
          <DialogDescription>
            This will create a new template in your account based on this example.
            You can customize it afterward.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{template.name}</h4>
              {template.category && (
                <Badge variant="secondary">{template.category}</Badge>
              )}
            </div>
            {template.description && (
              <p className="text-sm text-gray-600">{template.description}</p>
            )}
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter a name for your template"
              disabled={isCreating}
            />
            <p className="text-xs text-gray-500">
              You can rename this later if needed
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTemplate}
            disabled={isCreating || !templateName.trim()}
            className="bg-[#570df8] hover:bg-[#4a0bd4]"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
