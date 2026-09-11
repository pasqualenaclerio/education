int pinLed = 12;      //pin per il led
int pinSwitch_1 = 11;  //pin per l'interruttore
int pinSwitch_2 = 10;  //pin per l'interruttore

bool lettura_1;        //creo un contenuotre dove mettere la lettura del pulsante
bool lettura_2;        //creo un contenuotre dove mettere la lettura del pulsante
bool stato = LOW;     //imposto uno stato a basso;

void setup() {
  pinMode(pinLed, OUTPUT);  //settiamo il pin del led a ingresso
  pinMode(pinSwitch_1, INPUT); //settiamo il pin dell'interruttore a uscita
  pinMode(pinSwitch_2, INPUT); //settiamo il pin dell'interruttore a uscita
}

void loop() {
  lettura_1 = digitalRead(pinSwitch_1);  //leggiamo il valore del pin 11 e salviamolo
  lettura_2 = digitalRead(pinSwitch_2);  //leggiamo il valore del pin 11 e salviamolo
  

  if((lettura_1 && !lettura_2)||(!lettura_1 && lettura_2)){                    //se la lettura è alta
    stato = !stato;                       //cambia lo stato
    delay(200);                           //aspetta qualche secondo
  }
  

  if(stato == HIGH){                    //se lo stato è alta
    
      digitalWrite(pinLed, HIGH);        //accendi il led
      
    }
    else{                                //altrimenti
      
      digitalWrite(pinLed, LOW);         //tieni spento il led
      
      }

}
