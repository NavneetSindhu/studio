
"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionnaireData } from "@/ai/flows/classify-image"; // Import the type

// Define Zod schema for validation matching the Genkit flow input
const formSchema = z.object({
  age: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Please enter a valid age" }).positive("Age must be positive").int("Age must be a whole number").optional()
  ).optional(),
  gender: z.string().optional(),
  complexion: z.string().optional(),
  products: z.string().optional(),
  symptoms: z.string().min(1, "Please select the primary issue/symptom"), // Keep symptoms required for context
});


type QuestionnaireFormValues = z.infer<typeof formSchema>;

interface QuestionnaireModalProps {
  children: React.ReactNode; // To wrap the trigger button
  onSave: (data: QuestionnaireData) => void; // Callback to pass data up
}

// Placeholder data - replace with actual options
const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
const complexionOptions = [
  "Very Fair",
  "Fair",
  "Medium",
  "Olive",
  "Brown",
  "Dark Brown/Black",
];
const symptomOptions = [
  "Acne/Pimples",
  "Eczema/Rashes",
  "Psoriasis Plaques",
  "Vitiligo Patches",
  "Suspicious Mole",
  "Dryness",
  "Itching",
  "Redness",
  "Flaking",
  "Blisters",
  "Other",
];

export function QuestionnaireModal({ children, onSave }: QuestionnaireModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: "",
      complexion: "",
      products: "",
      symptoms: "",
    },
  });

  // Updated onSubmit to call the onSave prop
  const onSubmit: SubmitHandler<QuestionnaireFormValues> = (data) => {
     // Prepare data in the format expected by QuestionnaireData
     const saveData: QuestionnaireData = {
       age: data.age,
       gender: data.gender || undefined, // Ensure empty strings become undefined
       complexion: data.complexion || undefined,
       products: data.products || undefined,
       symptoms: data.symptoms, // Symptoms is required by schema here
     };
     console.log("Submitting Questionnaire Data:", saveData);
     onSave(saveData); // Pass the formatted data up
     setIsOpen(false); // Close modal on submit
     form.reset(); // Reset form after submission
   };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Assess Your Skin</DialogTitle>
          <DialogDescription>
            Please answer a few questions to help the AI provide a more contextual analysis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (Optional)</FormLabel>
                    <FormControl>
                       {/* Ensure onChange handles empty string correctly */}
                       <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="complexion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complexion (Optional)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select complexion" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {complexionOptions.map((option) => (
                           <SelectItem key={option} value={option}>
                             {option}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Lotions/Products Used (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any skincare products you currently use..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Helps understand potential interactions or routines.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Issue / Symptom*</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select primary symptom" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {symptomOptions.map((option) => (
                         <SelectItem key={option} value={option}>
                           {option}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <FormDescription>
                        Select the main concern you are experiencing.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Save Assessment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

