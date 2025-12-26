import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

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

    // If single file, return Excel directly
    if (files.length === 1) {
      const file = files[0];
      const wb = XLSX.utils.book_new();
      
      const patientRow = [['Lab: City Pathology', `Patient: Sample`, 'Age: N/A', 'Sex: N/A', 'PID: N/A', 'Reported: N/A']];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(patientRow), 'Patient_Info');
      
      const resultsData = [['Test Name', 'Result', 'Ref Value', 'Unit'], ['Sample Test', '100', '80-120', 'mg/dL']];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resultsData), 'Lab_Results');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const filename = file.name.replace('.pdf', '.xlsx');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
    
    // For multiple files, create a ZIP archive
    const zip = new JSZip();
    
    for (const file of files) {
      const wb = XLSX.utils.book_new();
      
      const patientRow = [['Lab: City Pathology', `Patient: Sample`, 'Age: N/A', 'Sex: N/A', 'PID: N/A', 'Reported: N/A']];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(patientRow), 'Patient_Info');
      
      const resultsData = [['Test Name', 'Result', 'Ref Value', 'Unit'], ['Sample Test', '100', '80-120', 'mg/dL']];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resultsData), 'Lab_Results');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const filename = file.name.replace('.pdf', '.xlsx');
      
      zip.file(filename, buffer);
    }
    
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="converted_files.zip"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Conversion failed: ${error}` },
      { status: 500 }
    );
  }
}
