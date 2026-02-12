import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const json = await request.json();
        
        // Build CSV content
        const headers = 'description,seatnumber\n';
        const rows = Object.entries(json)
            .map(([key, value]) => {
                // Escape quotes and wrap in quotes if needed
                const escapedKey = `"${String(key).replace(/"/g, '""')}"`;
                const escapedValue = `"${String(value).replace(/"/g, '""')}"`;
                return `${escapedKey},${escapedValue}`;
            })
            .join('\n');
        
        const csvContent = headers + rows;
        
        // Return CSV as downloadable file
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="output.csv"',
            },
        });
    } catch (error) {
        console.error('Error creating CSV:', error);
        return NextResponse.json(
            { error: 'Failed to create CSV' },
            { status: 500 }
        );
    }
}
