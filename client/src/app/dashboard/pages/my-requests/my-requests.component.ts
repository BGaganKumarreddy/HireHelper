import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService, Request } from '../../../services/request.service';

@Component({
    selector: 'app-my-requests',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './my-requests.component.html',
    styleUrls: ['./my-requests.component.css']
})
export class MyRequestsComponent implements OnInit {
    private requestService = inject(RequestService);
    private cdr = inject(ChangeDetectorRef);

    requests: Request[] = [];
    loading = true;
    error: string | null = null;

    ngOnInit(): void {
        this.fetchMyRequests();
    }

    fetchMyRequests(): void {
        this.loading = true;
        this.error = null;

        this.requestService.getMyRequests().subscribe({
            next: (response) => {
                if (response && response.success) {
                    this.requests = response.requests || [];
                } else {
                    this.error = 'Failed to load your requests.';
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching my requests', err);
                this.error = 'Failed to load your requests. Please try again later.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }
}
