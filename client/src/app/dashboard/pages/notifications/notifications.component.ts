import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotificationService, AppNotification } from '../../../services/app-notification.service';
import { DashboardComponent } from '../../dashboard.component';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notifications.component.html',
    styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
    private notificationService = inject(AppNotificationService);
    private dashboard = inject(DashboardComponent);

    notifications: AppNotification[] = [];
    loading = true;
    error = '';

    ngOnInit(): void {
        this.fetchNotifications();
    }

    fetchNotifications(): void {
        this.loading = true;
        this.notificationService.getNotifications().subscribe({
            next: (res) => {
                this.notifications = res.notifications;
                this.loading = false;
                this.updateDashboardBadge();
            },
            error: (err) => {
                console.error('Error fetching notifications:', err);
                this.error = 'Failed to load notifications.';
                this.loading = false;
            }
        });
    }

    markAsRead(id: number): void {
        const notif = this.notifications.find(n => n.id === id);
        if (notif && !notif.is_read) {
            this.notificationService.markAsRead(id).subscribe({
                next: () => {
                    notif.is_read = true;
                    this.updateDashboardBadge();
                },
                error: (err) => console.error('Error marking as read:', err)
            });
        }
    }

    markAllAsRead(): void {
        const unreadTasks = this.notifications.filter(n => !n.is_read);
        if (unreadTasks.length === 0) return;

        this.notificationService.markAllAsRead().subscribe({
            next: () => {
                this.notifications.forEach(n => n.is_read = true);
                this.updateDashboardBadge();
            },
            error: (err) => console.error('Error marking all as read:', err)
        });
    }

    private updateDashboardBadge(): void {
        const unreadCount = this.notifications.filter(n => !n.is_read).length;
        this.dashboard.unreadCount.set(unreadCount);
    }
}
