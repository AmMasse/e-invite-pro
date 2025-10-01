import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';

interface GuestData {
  name: string;
  email?: string;
  phone?: string;
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

interface ExcelUploadProps {
  eventId?: string;
  onDataParsed?: (guests: GuestData[]) => void;
}

const ExcelUpload = ({ eventId, onDataParsed }: ExcelUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<GuestData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  const validateGuestData = (row: any, rowNumber: number): GuestData => {
    const errors: string[] = [];
    
    // Validate name (required)
    const name = row.name || row.Name || row.NAME || "";
    if (!name || name.trim().length === 0) {
      errors.push("Name is required");
    } else if (name.trim().length > 100) {
      errors.push("Name must be less than 100 characters");
    }

    // Validate email (optional but must be valid format)
    const email = row.email || row.Email || row.EMAIL || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push("Invalid email format");
    }

    // Validate phone (optional)
    const phone = row.phone || row.Phone || row.PHONE || "";
    if (phone && phone.length > 20) {
      errors.push("Phone number too long");
    }

    return {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      rowNumber,
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setParsedData([]);

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      setError("Please upload a valid Excel file (.xlsx, .xls) or CSV file");
      setFile(null);
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setFile(null);
      return;
    }

    await processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setError("The Excel file is empty");
        setIsProcessing(false);
        return;
      }

      if (jsonData.length > 1000) {
        setError("Maximum 1000 guests per upload");
        setIsProcessing(false);
        return;
      }

      // Validate and parse each row
      const guests = jsonData.map((row, index) => 
        validateGuestData(row, index + 2) // +2 because Excel rows start at 1 and we skip header
      );

      setParsedData(guests);
      
      if (onDataParsed) {
        onDataParsed(guests);
      }
    } catch (err) {
      console.error("Error processing file:", err);
      setError("Failed to process Excel file. Please ensure it's properly formatted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const validGuests = parsedData.filter(g => g.isValid);
  const invalidGuests = parsedData.filter(g => !g.isValid);

  return (
    <div className="space-y-6">
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-accent" />
            Excel Guest Upload
          </CardTitle>
          <CardDescription>
            Upload an Excel file (.xlsx, .xls) or CSV with guest information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-accent/20 rounded-lg p-8 text-center hover:border-accent/40 transition-colors">
            <input
              type="file"
              id="excel-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-accent" />
              <p className="text-sm font-medium mb-2">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                Excel (.xlsx, .xls) or CSV files (Max 5MB, 1000 guests)
              </p>
            </label>
          </div>

          {isProcessing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Processing file...</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {parsedData.length > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Found {parsedData.length} guests: {validGuests.length} valid, {invalidGuests.length} with errors
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Expected Excel Format:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• <strong>name</strong> (required): Guest's full name</p>
              <p>• <strong>email</strong> (optional): Guest's email address</p>
              <p>• <strong>phone</strong> (optional): Guest's phone number</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg">Preview Guest Data</CardTitle>
            <CardDescription>
              Review the parsed data before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((guest, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{guest.rowNumber}</TableCell>
                      <TableCell>{guest.name || <span className="text-muted-foreground italic">Missing</span>}</TableCell>
                      <TableCell>{guest.email || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>{guest.phone || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>
                        {guest.isValid ? (
                          <Badge className="bg-success/10 text-success border-success/20">Valid</Badge>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="destructive">Invalid</Badge>
                            <div className="text-xs text-destructive">
                              {guest.errors.map((err, i) => (
                                <div key={i}>• {err}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelUpload;
