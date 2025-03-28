import { Component, OnInit } from '@angular/core';
import { Service } from '../models/service.model';
import { Modal } from 'bootstrap'; 
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  faqs: { question: string, answer: string }[] = [
    {
      question: 'What is EcoEggs Market Hub?',
      answer: 'EcoEggsFarm Market Hub is a platform designed to bridge the gap between farmers and the market, offering services like consulting, market analysis, supply chain management, product sales, and delivery services.'
    },
    {
      question: 'How can I join the platform?',
      answer: 'You can join the platform by registering on our website. Click on the "Sign Up" button and follow the instructions.'
    },
    {
      question: 'What services do you offer?',
      answer: 'We offer a variety of services including expert consulting, market analysis, supply chain management, product sales, and delivery services.'
    },
    {
      question: 'Where are you located?',
      answer: 'Our main office is located in TransMara-East, but our services are available to farmers and businesses across the region.'
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can contact our customer support through the "Contact Us" page on our website or by calling our support hotline.'
    }
  ];

  selectedFaq: { question: string, answer: string } | undefined;

  constructor(private serviceService: ServiceService) { }

  ngOnInit(): void { }

  openModal(faq: { question: string, answer: string }): void {
    this.selectedFaq = faq;
    const modalElement = document.getElementById('faqModal');
    if (modalElement) {
      const modal = new Modal(modalElement); 
      modal.show();
    }
  }
}
