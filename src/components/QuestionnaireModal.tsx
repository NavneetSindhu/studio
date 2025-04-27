
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
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists
import { AlertCircle } from "lucide-react";

// Define Zod schema for validation
const formSchema = z.object({
  age: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)), // Convert empty string to undefined, then to number
    z.number({ invalid_type_error: "Please enter a valid age" }).positive().int().optional()
  ),
  gender: z.string().min(1, "Please select a gender"),
  complexion: z.string().min(1, "Please select your complexion"),
  products: z.string().optional(),
  symptoms: z.string().min(1, "Please select the primary issue/symptom"),
});

type QuestionnaireFormValues = z.infer<typeof formSchema>;

interface QuestionnaireModalProps {
  children: React.ReactNode; // To wrap the trigger button
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

export function QuestionnaireModal({ children }: QuestionnaireModalProps) {
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

  const onSubmit: SubmitHandler<QuestionnaireFormValues> = (data) => {
    console.log("Questionnaire Data:", data);
    // Here you would typically send the data to your backend or AI flow
    setIsOpen(false); // Close modal on submit
    form.reset(); // Reset form after submission
    // Optionally, show a success message or trigger next step
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Assess Your Skin</DialogTitle>
          <DialogDescription>
            Please answer a few questions to help us understand your skin concerns better. This information is optional for image analysis but can provide context.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                       <Input type="number" placeholder="e.g., 25" {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} />
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
                    <FormLabel>Gender</FormLabel>
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
                    <FormLabel>Complexion</FormLabel>
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
                    This helps understand potential interactions or routines.
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
                  <FormLabel>Primary Issue / Symptom</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Submit Assessment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

