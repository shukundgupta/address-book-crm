import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customers/customer';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  chart: any;

  stats = {
    total: 0,
    new: 0,
    existing: 0
  };

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  goToAddCustomer() {
    this.router.navigate(['/add-customer']);
  }

  loadStats() {
    this.customerService.getStats().subscribe({
      next: (res: any) => {
        this.stats.total = res.total;
        this.stats.new = res.new_count;
        this.stats.existing = res.existing_count;
        this.cdr.detectChanges();
        this.createChart();
      },
      error: (err) => {
        console.error('Dashboard Error:', err);
        this.snack.open('Failed to load dashboard stats. Please login again.', 'OK', { duration: 3000 });
      }
    });
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['New Customers', 'Existing Customers'],
        datasets: [{
          data: [this.stats.new, this.stats.existing],
          backgroundColor: [
            '#4caf50', // New - Green
            '#ff9800'  // Existing - Orange
          ],
          hoverBackgroundColor: [
            '#66bb6a',
            '#ffb74d'
          ],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 25,
              usePointStyle: true,
              font: {
                size: 14,
                family: "'Inter', 'Segoe UI', sans-serif",
                weight: 'bold'
              },
              color: '#444'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            bodyFont: { size: 14 },
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = this.stats.new + this.stats.existing;
                const percentage = Math.round((value / total) * 100);
                return ` ${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
  }
}