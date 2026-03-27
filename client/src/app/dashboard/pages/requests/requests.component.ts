import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService, Request } from '../../../services/request.service';

@Component({
    selector: 'app-requests',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
    private requestService = inject(RequestService);
    private cdr = inject(ChangeDetectorRef);

    requests: Request[] = [];
    loading = true;
    error: string | null = null;

    ngOnInit(): void {
        this.fetchIncomingRequests();
    }

    fetchIncomingRequests(): void {
        this.loading = true;
        this.error = null;

        this.requestService.getIncomingRequests().subscribe({
            next: (response) => {
                if (response && response.success) {
                    this.requests = response.requests || [];
                } else {
                    this.error = 'Failed to load requests.';
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching incoming requests', err);
                this.error = 'Failed to load requests. Please try again later.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onUpdateStatus(requestId: number | undefined, status: string): void {
        if (!requestId) return;

        this.requestService.updateRequestStatus(requestId, status).subscribe({
            next: (response) => {
                if (response.success) {
                    const req = this.requests.find(r => r.id === requestId);
                    if (req) req.status = status;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => console.error('Error updating status', err)
        });
    }
}
