import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('pdfs') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No PDF files provided' },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const file of files) {
      const wb = XLSX.utils.book_new();
      
      const patientRow = [['Lab: City Pathology', `Patient: Sample`, 'Age: N/A', 'Sex: N/A', 'PID: N/A', 'Reported: N/A']];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(patientRow), 'Patient_Info');
      
      const resultsData = [['Test Name', 'Result', 'Ref Value', 'Unit'], ['Sample Test', '100', '80-120', 'mg/dL']];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resultsData), 'Lab_Results');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      results.push({ 
        name: file.name.replace('.pdf', '.xlsx'), 
        buffer: buffer.toString('base64')
      });
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    return NextResponse.json(
      { error: `Conversion failed: ${error}` },
      { status: 500 }
    );
  }
}
