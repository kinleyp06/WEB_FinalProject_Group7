---

## 💰 Phase 3: Advanced Features & Backend Integration (April 19 - May 11)

### Overview
Phase 3 covers the advanced features from your proposal: financial management, profanity filter, special meal polls, real-time notifications, and full integration. This phase has multiple sections assigned to different team members.

**Timeline Breakdown:**
- Student History Page: April 19-23 (Sonam Wangmo)
- Admin Financial Module: April 23-27 (Tshering Tenzin)
- Profanity Filter & Moderation: April 27 - May 1 (Pelden Nidup)
- Special Meal & Poll Side-Page: May 1-4 (Sonam Wangmo & Tshering Tenzin)
- Real-Time Notifications: May 4-7 (Yeshi Lhendrup)
- Integration & Testing: May 7-11 (Yeshi Lhendrup)

---

## Section 12: Student History Page (April 19-23)
**Assigned to: Sonam Wangmo**

### Step 12.1: Create Backend API for History

**File: `backend/src/feedback/feedback.module.ts`**

```typescript
// backend/src/feedback/feedback.module.ts
import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
```

**File: `backend/src/feedback/feedback.service.ts`**

```typescript
// backend/src/feedback/feedback.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FeedbackService {
  async createFeedback(userId: string, rating: number, comment: string) {
    return prisma.feedback.create({
      data: {
        rating,
        comment,
        userId,
        status: 'PENDING',
      },
    });
  }

  async getUserFeedback(userId: string) {
    return prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserSuggestions(userId: string) {
    return prisma.suggestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserVotes(userId: string) {
    return prisma.pollVote.findMany({
      where: { userId },
      include: { poll: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

**File: `backend/src/feedback/feedback.controller.ts`**

```typescript
// backend/src/feedback/feedback.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  async createFeedback(@Req() req: any, @Body() body: { rating: number; comment: string }) {
    return this.feedbackService.createFeedback(req.user.userId, body.rating, body.comment);
  }

  @Get('my')
  async getMyFeedback(@Req() req: any) {
    return this.feedbackService.getUserFeedback(req.user.userId);
  }
}

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionController {
  constructor(private feedbackService: FeedbackService) {}

  @Get('my')
  async getMySuggestions(@Req() req: any) {
    return this.feedbackService.getUserSuggestions(req.user.userId);
  }
}

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VoteController {
  constructor(private feedbackService: FeedbackService) {}

  @Get('my')
  async getMyVotes(@Req() req: any) {
    return this.feedbackService.getUserVotes(req.user.userId);
  }
}
```

### Step 12.2: Update App Module

**Update `backend/src/app.module.ts`:**

```typescript
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { FeedbackController, SuggestionController, VoteController } from './feedback/feedback.controller';
import { FeedbackService } from './feedback/feedback.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController, FeedbackController, SuggestionController, VoteController],
  providers: [FeedbackService],
})
export class AppModule {}
```

### Step 12.3: Update Frontend History Page with Real Data

**Update `frontend/app/dashboard/student/history/page.tsx`:**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMyFeedback } from "@/hooks/useFeedback";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, Vote, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Fetch suggestions
function useMySuggestions() {
  return useQuery({
    queryKey: ["suggestions", "my"],
    queryFn: async () => {
      const response = await api.get("/suggestions/my");
      return response.data;
    },
  });
}

// Fetch votes
function useMyVotes() {
  return useQuery({
    queryKey: ["votes", "my"],
    queryFn: async () => {
      const response = await api.get("/votes/my");
      return response.data;
    },
  });
}

export default function HistoryPage() {
  const { data: feedback, isLoading: feedbackLoading } = useMyFeedback();
  const { data: suggestions, isLoading: suggestionsLoading } = useMySuggestions();
  const { data: votes, isLoading: votesLoading } = useMyVotes();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle size={14} className="text-green-500" />;
      case "REJECTED":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <AlertCircle size={14} className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Activity</h1>
          <p className="text-gray-600">View your complete history of feedback, suggestions, and votes</p>
        </div>

        <Tabs defaultValue="feedback" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="votes">Poll Votes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feedback" className="space-y-4">
            {feedbackLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : feedback?.length > 0 ? (
              feedback.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{item.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === "APPROVED" ? "bg-green-100 text-green-700" :
                          item.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                    {item.comment && (
                      <p className="text-gray-600 mt-3 text-sm">{item.comment}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No feedback submitted yet</p>
                <p className="text-sm text-gray-400">Your feedback will appear here once you submit</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-4">
            {suggestionsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : suggestions?.length > 0 ? (
              suggestions.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        {item.isFlagged && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Flagged
                          </span>
                        )}
                        {getStatusIcon(item.status)}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === "APPROVED" ? "bg-green-100 text-green-700" :
                          item.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No suggestions submitted yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="votes" className="space-y-4">
            {votesLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : votes?.length > 0 ? (
              votes.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{item.poll.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          You voted for: <span className="font-medium text-blue-600">{item.choice}</span>
                        </p>
                      </div>
                      <Vote size={20} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Vote className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No votes cast yet</p>
                <p className="text-sm text-gray-400">Your poll votes will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
```

---

## Section 13: Admin Financial Module (April 23-27)
**Assigned to: Tshering Tenzin**

### Step 13.1: Create Backend for Grocery Bills

**File: `backend/src/bills/bills.module.ts`**

```typescript
// backend/src/bills/bills.module.ts
import { Module } from '@nestjs/common';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';

@Module({
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
```

**File: `backend/src/bills/bills.service.ts`**

```typescript
// backend/src/bills/bills.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

@Injectable()
export class BillsService {
  async uploadBill(
    fileName: string,
    fileUrl: string,
    totalAmount: number,
    billDate: Date,
    description: string,
    uploadedBy: string,
  ) {
    return prisma.groceryBill.create({
      data: {
        fileName,
        fileUrl,
        totalAmount,
        billDate,
        description,
        uploadedBy,
      },
    });
  }

  async getAllBills() {
    return prisma.groceryBill.findMany({
      orderBy: { billDate: 'desc' },
    });
  }

  async getBillsByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return prisma.groceryBill.findMany({
      where: {
        billDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { billDate: 'asc' },
    });
  }

  async getCostSummary() {
    const bills = await prisma.groceryBill.findMany();
    const total = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const average = bills.length > 0 ? total / bills.length : 0;
    
    // Group by month
    const monthlyData: Record<string, number> = {};
    bills.forEach(bill => {
      const monthKey = `${bill.billDate.getFullYear()}-${bill.billDate.getMonth() + 1}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + bill.totalAmount;
    });

    return {
      total,
      average,
      count: bills.length,
      monthly: Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })),
    };
  }

  async deleteBill(id: string) {
    const bill = await prisma.groceryBill.findUnique({ where: { id } });
    if (bill && bill.fileUrl) {
      // Delete file from disk (optional)
      const filePath = path.join(process.cwd(), 'uploads', path.basename(bill.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return prisma.groceryBill.delete({ where: { id } });
  }
}
```

**File: `backend/src/bills/bills.controller.ts`**

```typescript
// backend/src/bills/bills.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from '../guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
  constructor(private billsService: BillsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadBill(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { totalAmount: string; billDate: string; description: string },
  ) {
    return this.billsService.uploadBill(
      file.originalname,
      `/uploads/${file.filename}`,
      parseFloat(body.totalAmount),
      new Date(body.billDate),
      body.description,
      req.user.userId,
    );
  }

  @Get()
  async getAllBills() {
    return this.billsService.getAllBills();
  }

  @Get('summary')
  async getCostSummary() {
    return this.billsService.getCostSummary();
  }

  @Get('monthly/:year/:month')
  async getMonthlyBills(@Param('year') year: string, @Param('month') month: string) {
    return this.billsService.getBillsByMonth(parseInt(year), parseInt(month));
  }

  @Delete(':id')
  async deleteBill(@Param('id') id: string) {
    return this.billsService.deleteBill(id);
  }
}
```

### Step 13.2: Create Uploads Directory

```bash
cd Desktop/hostel-mess-system/backend
mkdir uploads
```

### Step 13.3: Update App Module

**Update `backend/src/app.module.ts`:**

```typescript
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { FeedbackController, SuggestionController, VoteController } from './feedback/feedback.controller';
import { FeedbackService } from './feedback/feedback.service';
import { BillsController } from './bills/bills.controller';
import { BillsService } from './bills/bills.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController, FeedbackController, SuggestionController, VoteController, BillsController],
  providers: [FeedbackService, BillsService],
})
export class AppModule {}
```

### Step 13.4: Create Frontend Bills Page

**File: `frontend/app/dashboard/admin/bills/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Upload, Trash2, DollarSign, TrendingUp, FileText, Calendar } from "lucide-react";
import toast from "react-hot-toast";

// Fetch bills
function useBills() {
  return useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const response = await api.get("/bills");
      return response.data;
    },
  });
}

// Fetch summary
function useBillsSummary() {
  return useQuery({
    queryKey: ["bills", "summary"],
    queryFn: async () => {
      const response = await api.get("/bills/summary");
      return response.data;
    },
  });
}

export default function BillsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: summary, isLoading: summaryLoading } = useBillsSummary();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/bills/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bills", "summary"] });
      toast.success("Bill uploaded successfully!");
      setIsUploadOpen(false);
      setFile(null);
      setTotalAmount("");
      setBillDate("");
      setDescription("");
    },
    onError: () => {
      toast.error("Failed to upload bill");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bills", "summary"] });
      toast.success("Bill deleted");
    },
    onError: () => {
      toast.error("Failed to delete bill");
    },
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !totalAmount || !billDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("totalAmount", totalAmount);
    formData.append("billDate", billDate);
    formData.append("description", description);

    await uploadMutation.mutateAsync(formData);
  };

  const chartData = summary?.monthly?.map((item: any) => ({
    month: item.month,
    amount: item.amount,
  })) || [];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Grocery Bills</h1>
            <p className="text-gray-600">Upload receipts and track costs</p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Grocery Bill</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label>Receipt File *</Label>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 5MB (JPEG, PNG, PDF)</p>
                </div>
                <div>
                  <Label>Total Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="Enter total amount"
                    required
                  />
                </div>
                <div>
                  <Label>Bill Date *</Label>
                  <Input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional notes about this bill"
                  />
                </div>
                <Button type="submit" disabled={uploadMutation.isPending} className="w-full">
                  {uploadMutation.isPending ? "Uploading..." : "Upload Bill"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{summaryLoading ? "..." : summary?.total?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{summaryLoading ? "..." : summary?.average?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? "..." : summary?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bills List */}
        <Card>
          <CardHeader>
            <CardTitle>All Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : bills?.length > 0 ? (
                bills.map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">{bill.fileName}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>₹{bill.totalAmount.toLocaleString()}</span>
                          <span>•</span>
                          <span>{new Date(bill.billDate).toLocaleDateString()}</span>
                          {bill.description && <span>• {bill.description}</span>}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(bill.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No bills uploaded yet</p>
                  <p className="text-sm">Click "Upload Bill" to add your first receipt</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

### Step 13.5: Serve Static Files in Backend

**Update `backend/src/main.ts` to serve uploaded files:**

```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(4000);
  console.log('Backend running on http://localhost:4000');
}
bootstrap();
```

---

## Section 14: Profanity Filter & Content Moderation (April 27 - May 1)
**Assigned to: Pelden Nidup**

### Step 14.1: Install Profanity Filter Library

```bash
cd Desktop/hostel-mess-system/backend
npm install bad-words
npm install @types/bad-words --save-dev
```

### Step 14.2: Create Moderation Service

**File: `backend/src/moderation/moderation.service.ts`**

```typescript
// backend/src/moderation/moderation.service.ts
import { Injectable } from '@nestjs/common';
import Filter from 'bad-words';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ModerationService {
  private filter: Filter;

  constructor() {
    this.filter = new Filter();
    // Add custom Bhutanese/Dzongkha words if needed
    this.filter.addWords('example-offensive-word');
  }

  // Check if text contains profanity
  containsProfanity(text: string): boolean {
    return this.filter.isProfane(text);
  }

  // Filter profanity from text (replaces with ***)
  filterProfanity(text: string): string {
    return this.filter.clean(text);
  }

  // Create suggestion with automatic flagging
  async createSuggestion(userId: string, title: string, description: string) {
    const isFlagged = this.containsProfanity(title + ' ' + description);
    
    return prisma.suggestion.create({
      data: {
        title: isFlagged ? this.filterProfanity(title) : title,
        description: isFlagged ? this.filterProfanity(description) : description,
        isFlagged,
        status: isFlagged ? 'PENDING' : 'APPROVED',
        userId,
      },
    });
  }

  // Get pending suggestions for moderation
  async getPendingSuggestions() {
    return prisma.suggestion.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Moderate a suggestion (approve or reject)
  async moderateSuggestion(suggestionId: string, status: 'APPROVED' | 'REJECTED') {
    return prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status },
    });
  }

  // Get all flagged content for admin review
  async getFlaggedContent() {
    const flaggedSuggestions = await prisma.suggestion.findMany({
      where: { isFlagged: true, status: 'PENDING' },
      include: { user: true },
    });

    const flaggedFeedback = await prisma.feedback.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
    });

    return {
      suggestions: flaggedSuggestions,
      feedback: flaggedFeedback,
    };
  }

  // Moderate feedback
  async moderateFeedback(feedbackId: string, status: 'APPROVED' | 'REJECTED') {
    return prisma.feedback.update({
      where: { id: feedbackId },
      data: { status },
    });
  }
}
```

**File: `backend/src/moderation/moderation.controller.ts`**

```typescript
// backend/src/moderation/moderation.controller.ts
import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get('pending')
  async getPendingContent() {
    return this.moderationService.getFlaggedContent();
  }

  @Put('suggestions/:id')
  async moderateSuggestion(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
  ) {
    return this.moderationService.moderateSuggestion(id, body.status);
  }

  @Put('feedback/:id')
  async moderateFeedback(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
  ) {
    return this.moderationService.moderateFeedback(id, body.status);
  }
}

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionController {
  constructor(private moderationService: ModerationService) {}

  @Post()
  async createSuggestion(
    @Req() req: any,
    @Body() body: { title: string; description: string },
  ) {
    return this.moderationService.createSuggestion(
      req.user.userId,
      body.title,
      body.description,
    );
  }

  @Get('my')
  async getMySuggestions(@Req() req: any) {
    return this.moderationService.getUserSuggestions(req.user.userId);
  }
}
```

**Add missing method to ModerationService:**

```typescript
// Add this method to ModerationService
async getUserSuggestions(userId: string) {
  return prisma.suggestion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
```

### Step 14.3: Create Moderation Module

**File: `backend/src/moderation/moderation.module.ts`**

```typescript
// backend/src/moderation/moderation.module.ts
import { Module } from '@nestjs/common';
import { ModerationController, SuggestionController } from './moderation.controller';
import { ModerationService } from './moderation.service';

@Module({
  controllers: [ModerationController, SuggestionController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
```

### Step 14.4: Create Frontend Moderation Page

**File: `frontend/app/dashboard/admin/moderation/page.tsx`**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, Lightbulb } from "lucide-react";
import toast from "react-hot-toast";

function usePendingContent() {
  return useQuery({
    queryKey: ["moderation", "pending"],
    queryFn: async () => {
      const response = await api.get("/moderation/pending");
      return response.data;
    },
  });
}

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = usePendingContent();

  const moderateSuggestion = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => {
      await api.put(`/moderation/suggestions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "pending"] });
      toast.success("Suggestion moderated");
    },
  });

  const moderateFeedback = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => {
      await api.put(`/moderation/feedback/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "pending"] });
      toast.success("Feedback moderated");
    },
  });

  const suggestions = data?.suggestions || [];
  const feedback = data?.feedback || [];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Content Moderation</h1>
          <p className="text-gray-600">Review flagged suggestions and feedback</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Pending: {suggestions.length + feedback.length}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="suggestions">
          <TabsList>
            <TabsTrigger value="suggestions">
              Suggestions ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="feedback">
              Feedback ({feedback.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4 mt-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No pending suggestions</p>
              </div>
            ) : (
              suggestions.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{item.title}</h3>
                          {item.isFlagged && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          From: {item.user?.name || item.user?.email} •{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => moderateSuggestion.mutate({ id: item.id, status: "APPROVED" })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => moderateSuggestion.mutate({ id: item.id, status: "REJECTED" })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4 mt-4">
            {feedback.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No pending feedback</p>
              </div>
            ) : (
              feedback.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Rating: {item.rating}/5</span>
                        </div>
                        {item.comment && (
                          <p className="text-gray-600 text-sm">{item.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          From: {item.user?.name || item.user?.email} •{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => moderateFeedback.mutate({ id: item.id, status: "APPROVED" })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => moderateFeedback.mutate({ id: item.id, status: "REJECTED" })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
```

---

## Section 15: Special Meal & Poll System (May 1-4)
**Assigned to: Sonam Wangmo & Tshering Tenzin**

### Step 15.1: Create Backend Poll API

**File: `backend/src/polls/polls.module.ts`**

```typescript
// backend/src/polls/polls.module.ts
import { Module } from '@nestjs/common';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';

@Module({
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
```

**File: `backend/src/polls/polls.service.ts`**

```typescript
// backend/src/polls/polls.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PollsService {
  async createPoll(
    title: string,
    description: string,
    options: string[],
    validUntil: Date,
  ) {
    return prisma.specialMealPoll.create({
      data: {
        title,
        description,
        options,
        validUntil,
        isActive: true,
      },
    });
  }

  async getActivePolls() {
    const now = new Date();
    return prisma.specialMealPoll.findMany({
      where: {
        isActive: true,
        validUntil: { gte: now },
      },
      orderBy: { validUntil: 'asc' },
    });
  }

  async getPollResults(pollId: string) {
    const votes = await prisma.pollVote.findMany({
      where: { pollId },
    });

    const results: Record<string, number> = {};
    votes.forEach(vote => {
      results[vote.choice] = (results[vote.choice] || 0) + 1;
    });

    return results;
  }

  async castVote(pollId: string, userId: string, choice: string) {
    // Check if poll is active
    const poll = await prisma.specialMealPoll.findUnique({
      where: { id: pollId },
    });

    if (!poll || !poll.isActive || new Date() > poll.validUntil) {
      throw new BadRequestException('Poll is not active');
    }

    // Check if user already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId,
        },
      },
    });

    if (existingVote) {
      throw new BadRequestException('You have already voted in this poll');
    }

    // Check if choice is valid
    if (!poll.options.includes(choice)) {
      throw new BadRequestException('Invalid choice');
    }

    return prisma.pollVote.create({
      data: {
        pollId,
        userId,
        choice,
      },
    });
  }

  async getUserVote(pollId: string, userId: string) {
    return prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId,
        },
      },
    });
  }

  async closePoll(pollId: string) {
    return prisma.specialMealPoll.update({
      where: { id: pollId },
      data: { isActive: false },
    });
  }
}
```

**File: `backend/src/polls/polls.controller.ts`**

```typescript
// backend/src/polls/polls.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PollsService } from './polls.service';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Get('active')
  async getActivePolls() {
    return this.pollsService.getActivePolls();
  }

  @Get(':id/results')
  async getPollResults(@Param('id') id: string) {
    return this.pollsService.getPollResults(id);
  }

  @Get(':id/my-vote')
  async getMyVote(@Param('id') id: string, @Req() req: any) {
    return this.pollsService.getUserVote(id, req.user.userId);
  }

  @Post(':id/vote')
  async castVote(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { choice: string },
  ) {
    return this.pollsService.castVote(id, req.user.userId, body.choice);
  }

  @Post()
  async createPoll(
    @Req() req: any,
    @Body() body: { title: string; description: string; options: string[]; validUntil: string },
  ) {
    // Only admin can create polls
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.pollsService.createPoll(
      body.title,
      body.description,
      body.options,
      new Date(body.validUntil),
    );
  }
}
```

### Step 15.2: Update Poll Hooks

**Update `frontend/hooks/usePolls.ts`:**

```tsx
// Add these new hooks
export function usePollMyVote(pollId: string) {
  return useQuery({
    queryKey: ["polls", pollId, "my-vote"],
    queryFn: async () => {
      const response = await api.get(`/polls/${pollId}/my-vote`);
      return response.data;
    },
    enabled: !!pollId,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pollData: {
      title: string;
      description: string;
      options: string[];
      validUntil: string;
    }) => {
      const response = await api.post("/polls", pollData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll created successfully!");
    },
    onError: () => {
      toast.error("Failed to create poll");
    },
  });
}
```

### Step 15.3: Create Admin Poll Management Page

**File: `frontend/app/dashboard/admin/polls/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useActivePolls, usePollResults, useCreatePoll } from "@/hooks/usePolls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, PieChart, Calendar, X } from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

function PollResults({ pollId }: { pollId: string }) {
  const { data: results, isLoading } = usePollResults(pollId);
  
  if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!results) return null;
  
  const chartData = Object.entries(results).map(([name, value]) => ({ name, value }));
  
  return (
    <div className="mt-3">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              label
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1">
        {chartData.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium">{item.value} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPollsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [validUntil, setValidUntil] = useState("");
  const createPoll = useCreatePoll();
  const { data: polls, refetch } = useActivePolls();

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }
    
    await createPoll.mutateAsync({
      title,
      description,
      options: validOptions,
      validUntil,
    });
    
    setIsCreateOpen(false);
    setTitle("");
    setDescription("");
    setOptions(["", ""]);
    setValidUntil("");
    refetch();
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Poll Management</h1>
            <p className="text-gray-600">Create and monitor special meal polls</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div>
                  <Label>Poll Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Special Meal for Thursday"
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the poll..."
                  />
                </div>
                <div>
                  <Label>Options *</Label>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 mt-2">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        required={idx < 2}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(idx)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                </div>
                <div>
                  <Label>Valid Until *</Label>
                  <Input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={createPoll.isPending} className="w-full">
                  {createPoll.isPending ? "Creating..." : "Create Poll"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {polls?.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{poll.title}</CardTitle>
                    {poll.description && (
                      <p className="text-sm text-gray-600 mt-1">{poll.description}</p>
                    )}
                  </div>
                  <Badge variant={poll.isActive ? "default" : "secondary"}>
                    {poll.isActive ? "Active" : "Closed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Until: {new Date(poll.validUntil).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PieChart size={14} />
                    <span>{poll.options.length} options</span>
                  </div>
                </div>
                <PollResults pollId={poll.id} />
              </CardContent>
            </Card>
          ))}
        </div>

        {(!polls || polls.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No polls created yet</p>
            <p className="text-sm text-gray-400">Click "Create Poll" to get started</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
```

### Step 15.4: Update Student Special Meals Page with Real Polls

**Update `frontend/app/dashboard/student/special-meals/page.tsx`:**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PollWidget } from "@/components/ui/PollWidget";
import { MealCard } from "@/components/ui/MealCard";
import { useActivePolls, useVote, usePollResults, usePollMyVote } from "@/hooks/usePolls";
import { Loader2 } from "lucide-react";

export default function SpecialMealsPage() {
  const { data: polls, isLoading: pollsLoading, refetch } = useActivePolls();
  const vote = useVote();

  const handleVote = async (pollId: string, choice: string) => {
    await vote.mutateAsync({ pollId, choice });
    refetch();
  };

  if (pollsLoading) {
    return (
      <DashboardLayout role="STUDENT">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if today is Monday or Thursday for special meal
  const today = new Date().getDay();
  const isSpecialDay = today === 1 || today === 4; // Monday=1, Thursday=4

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Special Meals</h1>
          <p className="text-gray-600">
            {isSpecialDay 
              ? "Today is a special meal day! Check out today's special." 
              : "Bi-weekly special meals on Monday & Thursday"}
          </p>
        </div>

        {/* Today's Special Meal - shown on Monday/Thursday */}
        {isSpecialDay && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Today's Special</h2>
            <MealCard
              mealName="Special Meal Day"
              mealType="LUNCH"
              description="Check the notice board or poll results for today's special menu"
              time="12:00 PM - 1:30 PM"
              isSpecial={true}
            />
          </div>
        )}

        {/* Active Polls */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Vote for Upcoming Special Meals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls?.map((poll) => (
              <PollWidget
                key={poll.id}
                pollId={poll.id}
                title={poll.title}
                description={poll.description}
                options={poll.options}
                onVote={handleVote}
              />
            ))}
            {(!polls || polls.length === 0) && (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No active polls at the moment</p>
                <p className="text-sm text-gray-400">Check back on Monday or Thursday for special meal polls</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## Section 16: Real-Time Notifications with WebSocket (May 4-7)
**Assigned to: Yeshi Lhendrup**

### Step 16.1: Install Socket.io

```bash
cd Desktop/hostel-mess-system/backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @types/socket.io --save-dev

cd Desktop/hostel-mess-system/frontend
npm install socket.io-client
```

### Step 16.2: Create WebSocket Gateway

**File: `backend/src/notifications/notifications.gateway.ts`**

```typescript
// backend/src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, string> = new Map(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.connectedClients.set(client.id, userId);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    for (const [socketId, connectedUserId] of this.connectedClients.entries()) {
      if (connectedUserId === userId) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }

  // Send notification to all connected clients
  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Send notification to all admins
  sendToAdmins(event: string, data: any) {
    // This requires storing user roles - implement as needed
    this.server.emit(event, data);
  }

  // Notify about meal plan change
  notifyMealUpdate(mealData: any) {
    this.sendToAll('meal-updated', {
      message: `Meal plan has been updated`,
      data: mealData,
      timestamp: new Date(),
    });
  }

  // Notify about new poll
  notifyNewPoll(pollData: any) {
    this.sendToAll('new-poll', {
      message: `New poll: ${pollData.title}`,
      data: pollData,
      timestamp: new Date(),
    });
  }

  // Notify about poll results
  notifyPollResults(pollId: string, results: any) {
    this.sendToAll('poll-results', {
      message: `Poll results are now available`,
      pollId,
      results,
      timestamp: new Date(),
    });
  }

  // Notify about content moderation
  notifyContentModerated(contentId: string, status: string) {
    this.sendToAll('content-moderated', {
      message: `Your submission has been ${status}`,
      contentId,
      status,
      timestamp: new Date(),
    });
  }
}
```

**File: `backend/src/notifications/notifications.module.ts`**

```typescript
// backend/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
```

### Step 16.3: Integrate Notifications with Other Services

**Update `backend/src/meals/meals.service.ts` (create if not exists):**

```typescript
// backend/src/meals/meals.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

const prisma = new PrismaClient();

@Injectable()
export class MealsService {
  constructor(private notificationsGateway: NotificationsGateway) {}

  async createMeal(mealData: any) {
    const meal = await prisma.mealPlan.create({ data: mealData });
    this.notificationsGateway.notifyMealUpdate(meal);
    return meal;
  }

  async updateMeal(id: string, mealData: any) {
    const meal = await prisma.mealPlan.update({
      where: { id },
      data: mealData,
    });
    this.notificationsGateway.notifyMealUpdate(meal);
    return meal;
  }

  async deleteMeal(id: string) {
    await prisma.mealPlan.delete({ where: { id } });
    this.notificationsGateway.sendToAll('meal-deleted', { mealId: id });
    return { success: true };
  }
}
```

### Step 16.4: Create Frontend Socket Hook

**File: `frontend/hooks/useSocket.ts`**

```tsx
"use client";
import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { getCurrentUser } from "@/lib/api";
import toast from "react-hot-toast";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const socket = io("http://localhost:4000", {
      auth: { userId: user.id },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Listen for meal updates
    socket.on("meal-updated", (data) => {
      toast.success(`🍽️ ${data.message}`, {
        duration: 5000,
        position: "top-right",
      });
    });

    // Listen for meal deletion
    socket.on("meal-deleted", (data) => {
      toast.info(`📋 A meal has been removed from the plan`, {
        duration: 5000,
      });
    });

    // Listen for new polls
    socket.on("new-poll", (data) => {
      toast.success(`📊 New Poll: ${data.message}`, {
        duration: 7000,
        action: {
          label: "Vote Now",
          onClick: () => {
            window.location.href = "/dashboard/student/special-meals";
          },
        },
      });
    });

    // Listen for poll results
    socket.on("poll-results", (data) => {
      toast.success(`📈 ${data.message}`, {
        duration: 5000,
      });
    });

    // Listen for content moderation updates
    socket.on("content-moderated", (data) => {
      if (data.status === "APPROVED") {
        toast.success(`✅ ${data.message}`);
      } else {
        toast.error(`❌ ${data.message}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, isConnected };
}

// Provider component to wrap the app
export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocket();
  return <>{children}</>;
}
```

### Step 16.5: Add Socket Provider to App

**Update `frontend/components/providers/AuthProvider.tsx`:**

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/hooks/useSocket";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        {children}
        <Toaster position="top-right" />
      </SocketProvider>
    </QueryClientProvider>
  );
}
```

---

## Section 17: Integration & Testing (May 7-11)
**Assigned to: Yeshi Lhendrup**

### Step 17.1: Create Test Scripts

**File: `backend/test/app.e2e-spec.ts`**

```typescript
// backend/test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should login existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });
  });

  describe('Meal Plans', () => {
    let authToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'admin123' });
      authToken = res.body.access_token;
    });

    it('should get all meals', () => {
      return request(app.getHttpServer())
        .get('/meals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
```

### Step 17.2: Update package.json Scripts

**Update `backend/package.json`:**

```json
"scripts": {
  "start": "npx nodemon --exec ts-node src/main.ts",
  "start:prod": "node dist/main.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

### Step 17.3: Create Integration Test Checklist

**File: `TESTING.md`** (create in project root)

```markdown
# Testing Checklist

## Authentication Tests
- [ ] User can register with email/password
- [ ] User cannot register with existing email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] JWT token is stored after login
- [ ] Protected routes redirect to login

## Meal Plan Tests
- [ ] Student can view meal plan
- [ ] Admin can create new meal
- [ ] Admin can edit existing meal
- [ ] Admin can delete meal
- [ ] Changes appear immediately on student dashboard

## Feedback Tests
- [ ] Student can submit feedback with rating
- [ ] Feedback appears in history
- [ ] Admin can view pending feedback
- [ ] Admin can approve/reject feedback

## Profanity Filter Tests
- [ ] Profane words are flagged automatically
- [ ] Flagged content goes to moderation queue
- [ ] Admin can approve flagged content
- [ ] Admin can reject flagged content

## Poll Tests
- [ ] Admin can create poll with multiple options
- [ ] Student can view active polls
- [ ] Student can vote only once per poll
- [ ] Poll results show real-time updates
- [ ] Expired polls are not visible

## Financial Module Tests
- [ ] Admin can upload grocery bill (image/PDF)
- [ ] File size limit is enforced (5MB)
- [ ] Cost summary chart displays correctly
- [ ] Monthly trends show accurate data
- [ ] Admin can delete bills

## WebSocket Tests
- [ ] Notifications appear when meal is updated
- [ ] New poll triggers notification
- [ ] Poll results trigger notification
- [ ] Connection reconnects automatically on disconnect

## Performance Tests
- [ ] Dashboard loads within 3 seconds
- [ ] Charts render with 500+ data points
- [ ] WebSocket messages delivered within 2 seconds
```

---

## Section 18: Deployment to Render (May 11-14)
**Assigned to: Kinley Pem**

### Step 18.1: Prepare Backend for Production

**Update `backend/package.json`:**

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main.js",
    "start:render": "prisma migrate deploy && node dist/main.js"
  }
}
```

**Create `backend/Dockerfile`:**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

### Step 18.2: Prepare Frontend for Production

**Update `frontend/next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### Step 18.3: Render Deployment Steps

1. **Create accounts:**
   - GitHub (free)
   - Render.com (free tier)

2. **Push code to GitHub:**
```bash
cd Desktop/hostel-mess-system
git add .
git commit -m "Complete Hostel Mess Management System"
git branch -M main
git remote add origin https://github.com/yourusername/hostel-mess-system.git
git push -u origin main
```

3. **Deploy Database on Render:**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Name: `hostel-mess-db`
   - Select Free tier
   - Copy the `External Database URL`

4. **Deploy Backend on Render:**
   - Click "New +" → "Web Service"
   - Connect to GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:render`
   - Add Environment Variables:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     ```
   - Select Free tier

5. **Deploy Frontend on Render:**
   - Click "New +" → "Static Site"
   - Connect to GitHub repository
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`
   - Add Environment Variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
     ```

### Step 18.4: Final Environment Variables

**Backend Environment (.env.production):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret-key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**Frontend Environment:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.onrender.com
```

---

## ✅ Phase 3 Completion Checklist

- [ ] Student History page with feedback, suggestions, votes tabs
- [ ] Admin Financial Module with bill upload and charts
- [ ] Profanity filter working on suggestions
- [ ] Admin Moderation page for reviewing flagged content
- [ ] Special Meal Poll system with real-time voting
- [ ] WebSocket notifications for meal updates and polls
- [ ] All API endpoints tested
- [ ] Application deployed to Render
- [ ] End-to-end testing completed

---

## 🎉 Final Project Structure

```
hostel-mess-system/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── bills/
│   │   │   │   ├── meals/
│   │   │   │   ├── moderation/
│   │   │   │   └── polls/
│   │   │   └── student/
│   │   │       ├── page.tsx
│   │   │       ├── feedback/
│   │   │       ├── history/
│   │   │       ├── meal-plan/
│   │   │       └── special-meals/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── providers/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   └── middleware.ts
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── bills/
│   │   ├── feedback/
│   │   ├── meals/
│   │   ├── moderation/
│   │   ├── notifications/
│   │   ├── polls/
│   │   └── guards/
│   ├── prisma/
│   │   └── schema.prisma
│   └── uploads/
└── README.md
```

---

## 🚀 Running the Complete Application

### Development Mode:
```bash
# Terminal 1 - Backend
cd backend
npm run start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Build:
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

### Access URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prisma Studio: http://localhost:5555

---

## 📚 Resources for Team Members

- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Socket.io Docs**: https://socket.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TanStack Query**: https://tanstack.com/query/latest

---

**Congratulations! You have completed the Hostel Mess Management System! 🎉**

**Project Submission Date:** May 21, 2026