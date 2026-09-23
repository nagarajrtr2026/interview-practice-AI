import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, scoreTone } from "@/lib/interview";
import { deleteInterview, listInterviews } from "@/lib/interviews";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Interview History — InterviewAI" },
      {
        name: "description",
        content: "Review and manage every interview answer you have analyzed.",
      },
      { property: "og:title", content: "Interview History — InterviewAI" },
      {
        property: "og:description",
        content: "Review and manage every interview answer you have analyzed.",
      },
      { property: "og:url", content: "/history" },
    ],
    links: [{ rel: "canonical", href: "/history" }],
  }),
  component: History,
});

function History() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["interviews"], queryFn: listInterviews });
  const remove = useMutation({
    mutationFn: deleteInterview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast.success("Record deleted");
    },
    onError: () => toast.error("Could not delete that record"),
  });

  const rows = data ?? [];

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold sm:text-3xl">Interview History</h1>
      <p className="mt-2 text-muted-foreground">Every analyzed answer, newest first.</p>

      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No interviews recorded yet.</p>
              <Button asChild className="mt-4">
                <Link to="/practice">Start Interview</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="min-w-56">Question</TableHead>
                    <TableHead className="text-center">Overall</TableHead>
                    <TableHead className="text-center">Communication</TableHead>
                    <TableHead className="text-center">Technical</TableHead>
                    <TableHead className="text-center">Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(row.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-1 max-w-72">{row.question}</span>
                          {row.is_demo && (
                            <Badge variant="secondary" className="shrink-0">
                              Demo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-center font-semibold ${scoreTone(row.overall_score)}`}
                      >
                        {row.overall_score}
                      </TableCell>
                      <TableCell className="text-center">{row.communication}</TableCell>
                      <TableCell className="text-center">{row.technical}</TableCell>
                      <TableCell className="text-center">{row.confidence}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" aria-label="View analysis">
                            <Link to="/analysis/$id" params={{ id: row.id }}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!row.is_demo && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Delete record">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this record?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This permanently removes the answer and its AI feedback.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => remove.mutate(row.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
