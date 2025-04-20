
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';

const LoginHistory = () => {
  const { user } = useAuth();

  const { data: loginHistory, isLoading } = useQuery({
    queryKey: ['loginHistory', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_logins')
        .select('*')
        .order('login_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading login history...</div>;
  }

  if (!loginHistory?.length) {
    return <div className="text-center py-4">No login history available.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Your recent login activity</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Browser</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loginHistory.map((login) => (
            <TableRow key={login.id}>
              <TableCell>
                {format(new Date(login.login_at), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <span className={login.success ? "text-green-600" : "text-red-600"}>
                  {login.success ? "Successful" : "Failed"}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {login.user_agent}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoginHistory;
