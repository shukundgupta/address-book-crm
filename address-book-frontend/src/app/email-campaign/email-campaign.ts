import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailCampaignService } from './email-campaign.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-email-campaign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-campaign.html',
  styleUrls: ['./email-campaign.css']
})
export class EmailCampaignComponent implements OnInit, AfterViewInit {

  @ViewChild('editorFrame')  editorFrame!:  ElementRef<HTMLIFrameElement>;
  @ViewChild('headerFrame')  headerFrame!:  ElementRef<HTMLIFrameElement>;
  @ViewChild('footerFrame')  footerFrame!:  ElementRef<HTMLIFrameElement>;

  /* ========================
     TABS
  ======================== */
  activeTab: 'compose' | 'preview' | 'history' = 'compose';

  /* ========================
     CAMPAIGN FORM
  ======================== */
  campaign = {
    campaign_name: '',
    subject: '',
    html_body: '',
    template_header: '',
    template_footer: '',
    template_color: '#1e3a5f',
    filter_type: 'all',
    filter_value: '',
    from_name: ''
  };

  /* ========================
     A4 PREVIEW BINDINGS
  ======================== */
  previewHeaderHtml: SafeHtml = '';
  previewBodyHtml: SafeHtml   = '';
  previewFooterHtml: SafeHtml = '';

  /* ========================
     FILTER OPTIONS
  ======================== */
  filterOptions = { states: [], cities: [], pincodes: [] };

  /* ========================
     PREVIEW
  ======================== */
  preview: any = null;
  previewLoading = false;

  /* ========================
     SEND STATE
  ======================== */
  sending = false;
  sendResult: any = null;
  sendError = '';

  /* ========================
     HISTORY
  ======================== */
  history: any[] = [];
  historyLoading = false;
  selectedCampaign: any = null;
  campaignLogs: any[] = [];
  detailLoading = false;

  /* ========================
     RICH TEXT EDITOR STATE
  ======================== */
  editorReady = false;
  currentFontSize  = '14px';
  currentFontFamily = 'Arial';
  currentColor    = '#000000';
  currentBgColor  = '#ffff00';
  tableRows = 3;
  tableCols = 3;
  showTablePicker    = false;
  showColorPicker    = false;
  showBgColorPicker  = false;
  showLinkDialog     = false;
  showImageDialog    = false;
  showHeaderImageDialog = false;
  linkUrl   = '';
  linkText  = '';
  imageUrl  = '';
  headerImageUrl   = '';
  headerImageWidth = 160;

  savedRange: Range | null = null;

  constructor(
    private emailService: EmailCampaignService,
    private sanitizer: DomSanitizer
  ) {}

  /* ========================
     INIT
  ======================== */
  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadHistory();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.campaign.from_name = user.company_name || 'Our Company';
  }

  ngAfterViewInit(): void {
    // Small delay so DOM frames are ready
    setTimeout(() => {
      this.initBodyEditor();
      this.initHeaderEditor();
      this.initFooterEditor();

      // Apply default templates after frames load
      setTimeout(() => {
        this.applyHeaderTemplate();
        this.applyFooterTemplate();
      }, 300);
    }, 100);
  }

  /* ========================
     INIT BODY RICH TEXT EDITOR
  ======================== */
  initBodyEditor(): void {
    const iframe = this.editorFrame?.nativeElement;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 30px 40px;
            font-family: Arial, sans-serif;
            font-size: 15px;
            color: #333;
            min-height: 400px;
            outline: none;
            line-height: 1.8;
          }
          body:empty:before {
            content: 'Write your campaign body content here...\\A\\AUse the toolbar above to format text, add images, bullet points, tables, and more.';
            color: #aaa;
            white-space: pre;
          }
          h1 { font-size: 24px; color: #1e3a5f; margin-bottom: 20px; }
          h2 { font-size: 20px; color: #1e3a5f; margin-top: 25px; }
          p { margin-bottom: 16px; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f9fafb; font-weight: bold; }
          img { max-width: 100%; border-radius: 8px; margin: 15px 0; }
          a { color: #1e3a5f; text-decoration: underline; }
          ul, ol { padding-left: 25px; margin-bottom: 16px; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body contenteditable="true" spellcheck="true">
        <h1 style="text-align: center;">Campaign Title - Premium Hydrogen Solution</h1>
        <p>Dear customer,</p>
        <p>Welcome to our latest promotional campaign. We are excited to share some revolutionary updates with you...</p>
      </body>
      </html>
    `);
    doc.close();
    doc.execCommand('defaultParagraphSeparator', false, 'p');
    this.editorReady = true;

    doc.body.addEventListener('input', () => {
      this.campaign.html_body = doc.body.innerHTML;
    });
  }

  /* ========================
     INIT HEADER EDITOR
  ======================== */
  initHeaderEditor(): void {
    this.initMiniFrame('headerFrame', (html: string) => {
      this.campaign.template_header = html;
    });
  }

  initFooterEditor(): void {
    this.initMiniFrame('footerFrame', (html: string) => {
      this.campaign.template_footer = html;
    });
  }

  private initMiniFrame(refName: 'headerFrame' | 'footerFrame', onChange: (html: string) => void): void {
    const iframe = (this as any)[refName]?.nativeElement as HTMLIFrameElement;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const bgColor = refName === 'headerFrame' ? this.campaign.template_color : this.campaign.template_color;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 14px 20px;
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #fff;
            background: ${bgColor};
            min-height: 60px;
            outline: none;
            line-height: 1.5;
          }
          img { max-height: 80px; max-width: 100%; }
          a { color: #fff; text-decoration: underline; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body contenteditable="true" spellcheck="false"></body>
      </html>
    `);
    doc.close();

    doc.body.addEventListener('input', () => {
      onChange(doc.body.innerHTML);
    });
  }

  /* ========================
     APPLY DEFAULT HEADER TEMPLATE
  ======================== */
  applyHeaderTemplate(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const companyName = user.company_name || this.campaign.from_name || 'Your Company';
    const color = this.campaign.template_color;

    const html = `
      <div style="background:${color}; padding: 30px 40px; border-bottom: 5px solid rgba(0,0,0,0.1);">
        <table style="width:100%;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 32px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1px;">
                ${companyName}
              </div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 5px; font-style: italic;">
                Innovation in Every Step
              </div>
            </td>
            <td style="text-align: right; vertical-align: middle;">
               <div style="background: rgba(255,255,255,0.2); padding: 10px 15px; display: inline-block; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3);">
                 <span style="font-size: 18px; font-weight: bold; color: #fff;">EST. 1992</span>
               </div>
            </td>
          </tr>
        </table>
      </div>
      <div style="height: 1px; background: rgba(255,255,255,0.1);"></div>
    `;

    const iframe = this.headerFrame?.nativeElement;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.body) {
        doc.body.innerHTML = html;
        this.campaign.template_header = html;
      }
    }
  }

  /* ========================
     APPLY DEFAULT FOOTER TEMPLATE
  ======================== */
  applyFooterTemplate(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const companyName = user.company_name || this.campaign.from_name || 'Your Company';
    
    const html = `
      <div style="background: #333; color: #fff; padding: 40px; font-family: sans-serif;">
        <table style="width: 100%;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 60%; padding-right: 20px;">
              <div style="font-size: 20px; font-weight: bold; border-bottom: 2px solid #555; padding-bottom: 10px; margin-bottom: 15px; color: #fff;">
                ${companyName}
              </div>
              <div style="font-size: 13px; line-height: 1.8; color: #ccc;">
                #48, Noothanchery, Madambakkam, Chennai - 600 126, India<br>
                Ph: +91 97395 33800 | +91 95000 00000<br>
                Email: hydrogenmktg@tiaano.com | Web: www.hydrogenanode.com
              </div>
            </td>
            <td style="width: 40%; vertical-align: top; text-align: right;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Connect With Us</div>
              <div>
                <a href="#" style="display:inline-block; margin-left: 10px; text-decoration:none;"><img src="https://cdn-icons-png.flaticon.com/32/174/174848.png" width="24" height="24" alt="FB"></a>
                <a href="#" style="display:inline-block; margin-left: 10px; text-decoration:none;"><img src="https://cdn-icons-png.flaticon.com/32/174/174855.png" width="24" height="24" alt="IG"></a>
                <a href="#" style="display:inline-block; margin-left: 10px; text-decoration:none;"><img src="https://cdn-icons-png.flaticon.com/32/3536/3536505.png" width="24" height="24" alt="LI"></a>
                <a href="#" style="display:inline-block; margin-left: 10px; text-decoration:none;"><img src="https://cdn-icons-png.flaticon.com/32/733/733579.png" width="24" height="24" alt="TW"></a>
              </div>
            </td>
          </tr>
        </table>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #444; font-size: 11px; color: #888; text-align: center;">
          Copyright &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
          You are receiving this email because you are a valued customer of ${companyName}.
        </div>
      </div>
      <div style="background: #e0f7fa; height: 10px;"></div>
    `;

    const iframe = this.footerFrame?.nativeElement;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.body) {
        doc.body.innerHTML = html;
        this.campaign.template_footer = html;
      }
    }
  }

  /* ========================
     UPDATE A4 PREVIEW
  ======================== */
  updatePreview(): void {
    // Sync content from iframes
    const hDoc = this.headerFrame?.nativeElement?.contentDocument || this.headerFrame?.nativeElement?.contentWindow?.document;
    const bDoc = this.editorFrame?.nativeElement?.contentDocument  || this.editorFrame?.nativeElement?.contentWindow?.document;
    const fDoc = this.footerFrame?.nativeElement?.contentDocument || this.footerFrame?.nativeElement?.contentWindow?.document;

    if (hDoc?.body) this.campaign.template_header = hDoc.body.innerHTML;
    if (bDoc?.body) this.campaign.html_body        = bDoc.body.innerHTML;
    if (fDoc?.body) this.campaign.template_footer  = fDoc.body.innerHTML;

    this.previewHeaderHtml = this.sanitizer.bypassSecurityTrustHtml(this.campaign.template_header);
    this.previewBodyHtml   = this.sanitizer.bypassSecurityTrustHtml(this.campaign.html_body);
    this.previewFooterHtml = this.sanitizer.bypassSecurityTrustHtml(this.campaign.template_footer);
  }

  /* ========================
     EXEC COMMAND (body editor)
  ======================== */
  exec(command: string, value?: string): void {
    const iframe = this.editorFrame?.nativeElement;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc) return;
    doc.execCommand(command, false, value);
    this.campaign.html_body = doc.body.innerHTML;
    iframe.contentWindow?.focus();
  }

  /* ========================
     EXEC COMMAND IN SPECIFIC FRAME
  ======================== */
  execInFrame(frameName: 'headerFrame' | 'footerFrame', command: string, value?: string): void {
    const iframe = (this as any)[frameName]?.nativeElement as HTMLIFrameElement;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.execCommand(command, false, value);
    iframe.contentWindow?.focus();
    if (frameName === 'headerFrame') this.campaign.template_header = doc.body.innerHTML;
    if (frameName === 'footerFrame') this.campaign.template_footer = doc.body.innerHTML;
  }

  /* ========================
     GET IFRAME DOC (body)
  ======================== */
  private getDoc(): Document | null {
    const iframe = this.editorFrame?.nativeElement;
    return iframe?.contentDocument || iframe?.contentWindow?.document || null;
  }

  /* ========================
     FONT SIZE
  ======================== */
  setFontSize(size: string): void {
    this.currentFontSize = size;
    this.exec('fontSize', '7');
    const doc = this.getDoc();
    if (doc) {
      const fonts = doc.querySelectorAll('font[size="7"]');
      fonts.forEach(f => {
        (f as HTMLElement).removeAttribute('size');
        (f as HTMLElement).style.fontSize = size;
      });
      this.campaign.html_body = doc.body.innerHTML;
    }
  }

  setFontFamily(font: string): void {
    this.currentFontFamily = font;
    this.exec('fontName', font);
  }

  /* ========================
     TEXT / BG COLOR
  ======================== */
  setColor(color: string): void {
    this.currentColor = color;
    this.exec('foreColor', color);
    this.showColorPicker = false;
  }

  setBgColor(color: string): void {
    this.currentBgColor = color;
    this.exec('hiliteColor', color);
    this.showBgColorPicker = false;
  }

  /* ========================
     ALIGNMENT
  ======================== */
  alignLeft()    { this.exec('justifyLeft'); }
  alignCenter()  { this.exec('justifyCenter'); }
  alignRight()   { this.exec('justifyRight'); }
  alignJustify() { this.exec('justifyFull'); }

  /* ========================
     LISTS
  ======================== */
  insertBulletList()   { this.exec('insertUnorderedList'); }
  insertNumberedList() { this.exec('insertOrderedList'); }

  /* ========================
     INSERT HR
  ======================== */
  insertHR() { this.exec('insertHorizontalRule'); }

  /* ========================
     INSERT TABLE
  ======================== */
  insertTable(): void {
    let html = `<table>`;
    for (let r = 0; r < this.tableRows; r++) {
      html += '<tr>';
      for (let c = 0; c < this.tableCols; c++) {
        html += '<td>&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += `</table><p></p>`;
    this.exec('insertHTML', html);
    this.showTablePicker = false;
  }

  /* ========================
     INSERT LINK
  ======================== */
  openLinkDialog(): void {
    const doc  = this.getDoc();
    const sel  = doc?.getSelection();
    this.linkText = sel?.toString() || '';
    this.showLinkDialog = true;
  }

  insertLink(): void {
    if (!this.linkUrl) return;
    const html = `<a href="${this.linkUrl}" target="_blank">${this.linkText || this.linkUrl}</a>`;
    this.exec('insertHTML', html);
    this.linkUrl = '';
    this.linkText = '';
    this.showLinkDialog = false;
  }

  /* ========================
     INSERT IMAGE (body)
  ======================== */
  openImageDialog(): void {
    this.showImageDialog = true;
  }

  insertImage(): void {
    if (!this.imageUrl) return;
    this.exec('insertImage', this.imageUrl);
    this.imageUrl = '';
    this.showImageDialog = false;
  }

  /* ========================
     INSERT IMAGE IN HEADER
  ======================== */
  openHeaderImageDialog(): void {
    this.showHeaderImageDialog = true;
  }

  insertHeaderImage(): void {
    if (!this.headerImageUrl) return;
    const html = `<img src="${this.headerImageUrl}" alt="Logo" style="height:${this.headerImageWidth}px;max-width:100%;" />`;
    const iframe = this.headerFrame?.nativeElement;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.body) {
        doc.execCommand('insertHTML', false, html);
        this.campaign.template_header = doc.body.innerHTML;
      }
    }
    this.headerImageUrl = '';
    this.showHeaderImageDialog = false;
  }

  /* ========================
     INSERT TEMPLATE VARIABLES
  ======================== */
  insertVariable(variable: string): void {
    this.exec('insertHTML', `<span style="color:#4f75f6;font-weight:bold;">${variable}</span>`);
  }

  /* ========================
     CLEAR EDITOR
  ======================== */
  clearEditor(): void {
    if (!confirm('Clear all body content?')) return;
    const doc = this.getDoc();
    if (doc) doc.body.innerHTML = '';
    this.campaign.html_body = '';
  }

  /* ========================
     LOAD FILTER OPTIONS
  ======================== */
  loadFilterOptions(): void {
    this.emailService.getFilterOptions().subscribe({
      next: (data) => this.filterOptions = data,
      error: (err) => console.error(err)
    });
  }

  /* ========================
     FILTER TYPE CHANGE
  ======================== */
  onFilterTypeChange(): void {
    this.campaign.filter_value = '';
    this.preview = null;
  }

  /* ========================
     PREVIEW RECIPIENTS
  ======================== */
  previewRecipients(): void {
    this.previewLoading = true;
    this.preview = null;

    this.emailService.previewCampaign({
      filter_type:  this.campaign.filter_type,
      filter_value: this.campaign.filter_value
    }).subscribe({
      next: (data) => {
        this.preview = data;
        this.previewLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.previewLoading = false;
      }
    });
  }

  /* ========================
     SEND CAMPAIGN
  ======================== */
  sendCampaign(): void {
    // Sync from iframes before send
    const hDoc = this.headerFrame?.nativeElement?.contentDocument || this.headerFrame?.nativeElement?.contentWindow?.document;
    const bDoc = this.editorFrame?.nativeElement?.contentDocument  || this.editorFrame?.nativeElement?.contentWindow?.document;
    const fDoc = this.footerFrame?.nativeElement?.contentDocument || this.footerFrame?.nativeElement?.contentWindow?.document;
    if (hDoc?.body) this.campaign.template_header = hDoc.body.innerHTML;
    if (bDoc?.body) this.campaign.html_body        = bDoc.body.innerHTML;
    if (fDoc?.body) this.campaign.template_footer  = fDoc.body.innerHTML;

    if (!this.campaign.campaign_name) { this.sendError = 'Campaign name is required'; return; }
    if (!this.campaign.subject)       { this.sendError = 'Subject is required'; return; }
    if (!this.campaign.html_body)     { this.sendError = 'Email body cannot be empty'; return; }

    const recipientCount = this.preview?.total ? this.preview.total : 'all matching';
    const confirmMsg = `Send to ${recipientCount} recipients one-by-one (3s gap each)?\n\nEst. time: ~${this.preview?.estimatedMinutes || '?'} minutes.\n\nSending will run in background.`;

    if (!confirm(confirmMsg)) return;

    this.sending = true;
    this.sendError = '';
    this.sendResult = null;

    this.emailService.sendCampaign(this.campaign).subscribe({
      next: (res) => {
        this.sendResult = res;
        this.sending = false;
        this.loadHistory();
      },
      error: (err) => {
        this.sendError = err.error?.message || 'Failed to send campaign';
        this.sending = false;
      }
    });
  }

  /* ========================
     RESET FORM
  ======================== */
  resetForm(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.campaign = {
      campaign_name: '',
      subject: '',
      html_body: '',
      template_header: '',
      template_footer: '',
      template_color: '#1e3a5f',
      filter_type: 'all',
      filter_value: '',
      from_name: user.company_name || 'Our Company'
    };

    const bDoc = this.getDoc();
    if (bDoc) bDoc.body.innerHTML = '';

    const hIframe = this.headerFrame?.nativeElement;
    if (hIframe) {
      const hDoc = hIframe.contentDocument || hIframe.contentWindow?.document;
      if (hDoc?.body) hDoc.body.innerHTML = '';
    }

    const fIframe = this.footerFrame?.nativeElement;
    if (fIframe) {
      const fDoc = fIframe.contentDocument || fIframe.contentWindow?.document;
      if (fDoc?.body) fDoc.body.innerHTML = '';
    }

    setTimeout(() => {
      this.applyHeaderTemplate();
      this.applyFooterTemplate();
    }, 100);

    this.preview = null;
    this.sendResult = null;
    this.sendError = '';
  }

  /* ========================
     LOAD HISTORY
  ======================== */
  loadHistory(): void {
    this.historyLoading = true;
    this.emailService.getHistory().subscribe({
      next: (data) => {
        this.history = data;
        this.historyLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.historyLoading = false;
      }
    });
  }

  /* ========================
     VIEW CAMPAIGN DETAIL
  ======================== */
  viewCampaign(id: number): void {
    this.detailLoading = true;
    this.emailService.getCampaignDetail(id).subscribe({
      next: (data) => {
        this.selectedCampaign = data.campaign;
        this.campaignLogs     = data.logs;
        this.detailLoading    = false;
      },
      error: (err) => {
        console.error(err);
        this.detailLoading = false;
      }
    });
  }

  closeDetail(): void {
    this.selectedCampaign = null;
    this.campaignLogs     = [];
  }

  /* ========================
     DELETE CAMPAIGN
  ======================== */
  deleteCampaign(id: number): void {
    if (!confirm('Delete this campaign history?')) return;
    this.emailService.deleteCampaign(id).subscribe({
      next: () => this.loadHistory(),
      error: (err) => alert(err.error?.message || 'Delete failed')
    });
  }

  /* ========================
     HELPERS
  ======================== */
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'sending':   return 'status-sending';
      case 'failed':    return 'status-failed';
      default:          return 'status-draft';
    }
  }

  getProgress(c: any): number {
    if (!c.total_recipients) return 0;
    return Math.round(((c.sent_count + c.failed_count) / c.total_recipients) * 100);
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  }
}
